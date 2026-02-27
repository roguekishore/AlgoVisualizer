/**
 * content-script.js — ISOLATED WORLD bridge.
 *
 * Auth check lives here (not in the background service worker) because
 * content-scripts run inside the LeetCode page and have full cookie access,
 * whereas MV3 service workers cannot reliably send session cookies to
 * external origins via fetch.
 *
 * Flow:
 *  1. lc-vantage-user  → cache the currently-signed-in LC username
 *  2. lc-vantage-result → compare cached LC user with stored linked user
 *                          match  → send to background for backend sync
 *                          miss   → warn and block
 */
console.log('[Vantage] DSA tracker active.');

// ── Context-invalidation guard ──────────────────────────────────────────────
// After the extension is reloaded / updated, the old content-script instances
// that are still alive in open tabs lose access to chrome.runtime / chrome.storage.
// Every call throws "Extension context invalidated".  We detect this once and
// shut down all polling / listeners so we don't spam the console.
let _contextDead = false;

function isContextValid() {
    try {
        // chrome.runtime.id is undefined when the context is invalidated
        return !_contextDead && !!chrome.runtime?.id;
    } catch {
        return false;
    }
}

function markContextDead() {
    if (_contextDead) return;       // already handled
    _contextDead = true;
    console.warn(
        '[Vantage] Extension was reloaded — this tab has a stale content-script. ' +
        'Please refresh the page (F5) to restore sync.'
    );
}

/**
 * Safe wrapper for chrome.storage.local.get.
 * Returns null if the context is dead (call silently skipped).
 */
function safeStorageGet(keys) {
    return new Promise(resolve => {
        if (!isContextValid()) { markContextDead(); resolve(null); return; }
        try {
            chrome.storage.local.get(keys, (result) => {
                if (chrome.runtime.lastError) { markContextDead(); resolve(null); return; }
                resolve(result);
            });
        } catch { markContextDead(); resolve(null); }
    });
}

function safeStorageSet(obj) {
    if (!isContextValid()) { markContextDead(); return; }
    try { chrome.storage.local.set(obj); }
    catch { markContextDead(); }
}

function safeStorageRemove(keys) {
    if (!isContextValid()) { markContextDead(); return; }
    try { chrome.storage.local.remove(keys); }
    catch { markContextDead(); }
}

function safeSendMessage(msg) {
    if (!isContextValid()) { markContextDead(); return; }
    try { chrome.runtime.sendMessage(msg); }
    catch { markContextDead(); }
}

const STORAGE_KEYS = ['lcusername', 'uid', 'sessionToken'];

// ── Localhost-only: keep chrome.storage in sync with the React ──────────────
// app's localStorage so the popup always shows the correct linked user.
// Stores uid, lcusername, and sessionToken so the popup can detect user
// switches and the background can authenticate sync requests.
if (location.hostname === 'localhost') {

    let pollTimer = null;   // so we can clear it on context death

    /**
     * Read the current user from localStorage and push uid + lcusername +
     * sessionToken into chrome.storage.local.
     */
    async function syncLcUsernameFromApp() {
        if (_contextDead) return;

        let lcusername, uid, sessionToken;
        try {
            const raw = localStorage.getItem('user');
            const user = raw ? JSON.parse(raw) : null;
            lcusername   = user?.lcusername   || null;
            uid          = user?.uid          ?? null;
            sessionToken = user?.sessionToken || null;
        } catch {
            return; // localStorage not available / corrupt JSON
        }

        const prev = await safeStorageGet(STORAGE_KEYS);
        if (!prev) return;  // context dead

        // Only write when the value actually changed
        if (prev.lcusername === lcusername &&
            prev.uid === uid &&
            prev.sessionToken === sessionToken) return;

        if (lcusername && uid != null && sessionToken) {
            safeStorageSet({ lcusername, uid, sessionToken });
            console.log('[Vantage] Synced lcusername from app:', lcusername, 'uid:', uid);
        } else {
            safeStorageRemove(STORAGE_KEYS);
            console.log('[Vantage] No lcusername in app — cleared storage.');
        }
    }

    // 1. Run immediately on page load (covers hard refreshes and new tabs)
    syncLcUsernameFromApp();

    // 2. Listen for login/logout signals from the React app (same-tab SPA nav)
    window.addEventListener('message', (e) => {
        if (_contextDead || e.source !== window) return;
        if (e.data?.type === 'VANTAGE_LOGIN') {
            const lc    = e.data.lcusername  || null;
            const uid   = e.data.uid         ?? null;
            const token = e.data.sessionToken || null;
            if (lc && uid != null && token) {
                safeStorageSet({ lcusername: lc, uid, sessionToken: token });
                console.log('[Vantage] Login signal — lcusername:', lc, 'uid:', uid);
            } else {
                safeStorageRemove(STORAGE_KEYS);
            }
        }
        if (e.data?.type === 'VANTAGE_LOGOUT') {
            safeStorageRemove(STORAGE_KEYS);
            console.log('[Vantage] Logout signal — cleared lcusername.');
        }
    });

    // 3. Cross-tab: if the user logs in/out in ANOTHER tab the 'storage'
    //    event fires on all other same-origin tabs. Re-sync immediately.
    window.addEventListener('storage', (e) => {
        if (_contextDead) return;
        if (e.key === 'user' || e.key === null /* clear() */) {
            console.log('[Vantage] Cross-tab localStorage change detected — re-syncing.');
            syncLcUsernameFromApp();
        }
    });

    // 4. Re-sync when the tab becomes visible again (user switches back to
    //    this tab after logging in/out elsewhere or after the laptop wakes).
    document.addEventListener('visibilitychange', () => {
        if (_contextDead) return;
        if (document.visibilityState === 'visible') {
            syncLcUsernameFromApp();
        }
    });

    // 5. Safety-net poll — catches any edge-case where postMessage or
    //    storage events were missed (e.g. extension reloaded mid-session).
    //    Clears itself when context dies to stop spamming.
    pollTimer = setInterval(() => {
        if (_contextDead) {
            clearInterval(pollTimer);
            return;
        }
        syncLcUsernameFromApp();
    }, 15_000);

    // Done — rest of the file is LeetCode-specific
}

if (location.hostname !== 'localhost') {
// ── Auth state (populated from injected.js via lc-vantage-user) ──────────────
let currentLcUser = null; // current LC session username (live from page)

window.addEventListener('lc-vantage-user', (e) => {
    currentLcUser = e.detail.isSignedIn ? (e.detail.username || null) : null;
    console.log('[Vantage] LC session:', currentLcUser ?? '(not signed in)');

    // Persist to chrome.storage so the popup can read it reliably.
    // The popup runs in the extension's own origin and cannot reliably
    // attach LeetCode cookies to its own fetch calls, so we bridge the
    // session info through storage instead.
    if (currentLcUser) {
        safeStorageSet({ lcSessionUser: currentLcUser });
    } else {
        safeStorageRemove(['lcSessionUser']);
    }
});

// ── Dedup key shared by both paths ───────────────────────────────────────────
let lastEventKey = '';

/**
 * Compare the live LC session with the stored linked account.
 * Returns { ok, username, reason } — mirrors background.js authGuard shape.
 */
async function authCheck() {
    if (_contextDead) return { ok: false, reason: 'context_dead' };

    const data = await safeStorageGet(['lcusername', 'uid']);
    if (!data) return { ok: false, reason: 'context_dead' };

    const linked = data.lcusername;
    const uid    = data.uid;

    if (!linked || uid == null) {
        return { ok: false, reason: 'no_link' };
    }
    if (!currentLcUser) {
        return { ok: true, username: linked };
    }
    if (currentLcUser.toLowerCase() !== linked.toLowerCase()) {
        return { ok: false, reason: 'mismatch', current: currentLcUser, linked };
    }
    return { ok: true, username: linked };
}

// ── Primary: CustomEvent from injected.js ────────────────────────────────────
window.addEventListener('lc-vantage-result', async (e) => {
    if (_contextDead) return;

    const d = e.detail;

    const key = `${d.slug}::${d.statusMsg}::${Math.floor(Date.now() / 1200)}`;
    if (key === lastEventKey) return;
    lastEventKey = key;

    console.log(`[Vantage] ${d.slug} → ${d.statusMsg} (${d.lang ?? '?'})`);

    const auth = await authCheck();

    if (!auth.ok) {
        if (auth.reason === 'mismatch') {
            console.warn(
                `[Vantage] ⛔ Blocked — LC session is @${auth.current} ` +
                `but the app is linked to @${auth.linked}. ` +
                `Open the popup and click "Sync Now" to re-link.`
            );
            safeSendMessage({
                action: 'authMismatch',
                current: auth.current,
                linked:  auth.linked,
            });
        } else if (auth.reason === 'no_link') {
            console.warn('[Vantage] No linked account. Open the popup and click "Sync Now" first.');
        }
        return;
    }

    if (d.accepted) {
        safeSendMessage({
            action:     'submissionAccepted',
            lcusername: auth.username,
            slug:       d.slug,
            lang:       d.lang,
            runtime:    d.runtime,
            statusCode: d.statusCode,
        });
    } else {
        safeSendMessage({
            action:     'submissionAttempted',
            lcusername: auth.username,
            slug:       d.slug,
            statusMsg:  d.statusMsg,
        });
    }
});

// ── Fallback: DOM MutationObserver ───────────────────────────────────────────
let lastDomKey = '';

const observer = new MutationObserver(() => {
    if (_contextDead) { observer.disconnect(); return; }

    const el = document.querySelector('[data-e2e-locator="submission-result"]');
    if (!el) return;

    const text = (el.innerText || '').trim();
    if (!text) return;

    const slug = window.location.pathname.split('/')[2] || '';
    if (!slug || slug === 'submissions' || slug === 'detail') return;

    const key = `${slug}::${text}`;
    if (key === lastDomKey) return;

    // Skip if the primary path (injected.js) already handled this exact result
    const primaryKey = lastEventKey.split('::').slice(0, 2).join('::');
    if (primaryKey === key) return;

    lastDomKey = key;

    console.log(`[Vantage] DOM fallback: ${slug} → ${text}`);

    authCheck().then(auth => {
        if (!auth.ok) return;

        if (text.includes('Accepted')) {
            safeSendMessage({
                action:     'submissionAccepted',
                lcusername: auth.username,
                slug,
                lang:       null,
                runtime:    null,
                statusCode: 10,
            });
        } else {
            safeSendMessage({
                action:     'submissionAttempted',
                lcusername: auth.username,
                slug,
                statusMsg:  text,
            });
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });

} // end: if (location.hostname !== 'localhost')
