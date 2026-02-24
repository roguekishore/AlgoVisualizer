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

// ── Auth state (populated from injected.js via lc-vantage-user) ──────────────
let currentLcUser = null; // current LC session username (live from page)

window.addEventListener('lc-vantage-user', (e) => {
    currentLcUser = e.detail.isSignedIn ? (e.detail.username || null) : null;
    console.log('[Vantage] LC session:', currentLcUser ?? '(not signed in)');
});

// ── Dedup key shared by both paths ───────────────────────────────────────────
let lastEventKey = '';

/**
 * Compare the live LC session with the stored linked account.
 * Returns { ok, username, reason } — mirrors background.js authGuard shape.
 */
async function authCheck() {
    return new Promise(resolve => {
        chrome.storage.local.get(['lcusername'], ({ lcusername: linked }) => {
            if (!linked) {
                resolve({ ok: false, reason: 'no_link' });
                return;
            }
            if (!currentLcUser) {
                // Session hasn't loaded yet or user isn't signed in.
                // Allow it — injected.js might have missed the timing on SPA nav.
                // The backend will reject if lcusername doesn't match any user.
                resolve({ ok: true, username: linked });
                return;
            }
            if (currentLcUser.toLowerCase() !== linked.toLowerCase()) {
                resolve({ ok: false, reason: 'mismatch', current: currentLcUser, linked });
                return;
            }
            resolve({ ok: true, username: linked });
        });
    });
}

// ── Primary: CustomEvent from injected.js ────────────────────────────────────
window.addEventListener('lc-vantage-result', async (e) => {
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
        } else if (auth.reason === 'no_link') {
            console.warn('[Vantage] No linked account. Open the popup and click "Sync Now" first.');
        }
        return;
    }

    if (d.accepted) {
        chrome.runtime.sendMessage({
            action:     'submissionAccepted',
            lcusername: auth.username,
            slug:       d.slug,
            lang:       d.lang,
            runtime:    d.runtime,
            statusCode: d.statusCode,
        });
    } else {
        chrome.runtime.sendMessage({
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
    const el = document.querySelector('[data-e2e-locator="submission-result"]');
    if (!el) return;

    const text = (el.innerText || '').trim();
    if (!text) return;

    const slug = window.location.pathname.split('/')[2] || '';
    if (!slug || slug === 'submissions' || slug === 'detail') return;

    const key = `${slug}::${text}`;
    if (key === lastDomKey) return;

    // Skip if the primary path (injected.js) already handled this exact result
    // lastEventKey format: "slug::statusMsg::timestampBucket"
    const primaryKey = lastEventKey.split('::').slice(0, 2).join('::');
    if (primaryKey === key) return;

    lastDomKey = key;

    console.log(`[Vantage] DOM fallback: ${slug} → ${text}`);

    authCheck().then(auth => {
        if (!auth.ok) return;

        if (text.includes('Accepted')) {
            chrome.runtime.sendMessage({
                action:     'submissionAccepted',
                lcusername: auth.username,
                slug,
                lang:       null,
                runtime:    null,
                statusCode: 10,
            });
        } else {
            chrome.runtime.sendMessage({
                action:     'submissionAttempted',
                lcusername: auth.username,
                slug,
                statusMsg:  text,
            });
        }
    });
});

observer.observe(document.body, { childList: true, subtree: true });