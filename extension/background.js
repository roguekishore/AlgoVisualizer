/**
 * background.js — MV3 service worker.
 *
 * Auth is handled in content-script.js (which has reliable cookie access
 * to LeetCode). By the time a message arrives here, the account-match check
 * has already passed. The service worker just forwards to the backend.
 *
 * Message actions handled:
 *   submissionAccepted  → POST /api/sync         (mark SOLVED)
 *   submissionAttempted → POST /api/sync/attempt  (mark ATTEMPTED)
 *   syncWithBackend     → legacy bulk sync from popup
 */

const BACKEND_SYNC    = 'http://localhost:8080/api/sync';
const BACKEND_ATTEMPT = 'http://localhost:8080/api/sync/attempt';

// ── Badge helpers ─────────────────────────────────────────────────────────────
function setBadge(text, color) {
    chrome.action.setBadgeText({ text });
    if (color) chrome.action.setBadgeBackgroundColor({ color });
}

function flashBadge(text, color, ms = 4000) {
    setBadge(text, color);
    setTimeout(() => setBadge('', '#888888'), ms);
}

// ── Backend calls ─────────────────────────────────────────────────────────────

/** Read the session token from chrome.storage.local. */
function getSessionToken() {
    return new Promise(resolve => {
        chrome.storage.local.get(['sessionToken'], ({ sessionToken }) => {
            resolve(sessionToken || null);
        });
    });
}

async function postSolved(lcusername, slugs) {
    const token = await getSessionToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(BACKEND_SYNC, {
        method:  'POST',
        headers,
        body:    JSON.stringify({ lcusername, leetcodeSlugs: slugs }),
    });
    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    return res.json();
}

async function postAttempt(lcusername, lcslug) {
    const token = await getSessionToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(BACKEND_ATTEMPT, {
        method:  'POST',
        headers,
        body:    JSON.stringify({ lcusername, lcslug }),
    });
    const body = await res.text();
    if (!res.ok) {
        console.warn('[Vantage] Attempt sync failed:', res.status, body);
        return null;
    }
    try { return JSON.parse(body); } catch { return body; }
}

// ── Message listener ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {

    // ── Auth mismatch warning from content-script ─────────────────────────────
    if (msg.action === 'authMismatch') {
        flashBadge('!', '#ef4444', 8000);
        console.warn(
            `[Vantage] ⚠ Account mismatch — LC session is @${msg.current} ` +
            `but the app is linked to @${msg.linked}.`
        );
        return false;
    }

    // ── Accepted submission → mark SOLVED ─────────────────────────────────────
    if (msg.action === 'submissionAccepted') {
        const { lcusername, slug } = msg;
        if (!lcusername || !slug) return false;

        (async () => {
            try {
                const result = await postSolved(lcusername, [slug]);
                console.log(`[Vantage] ✓ ${slug} synced:`, result);
                flashBadge('✓', '#22c55e');
            } catch (err) {
                console.error('[Vantage] Sync error:', err.message);
                flashBadge('E', '#f97316');
            }
        })();
        return false;
    }

    // ── Non-accepted submission → mark ATTEMPTED ──────────────────────────────
    if (msg.action === 'submissionAttempted') {
        const { lcusername, slug } = msg;
        if (!lcusername || !slug) return false;

        (async () => {
            try {
                const result = await postAttempt(lcusername, slug);
                if (result) {
                    console.log(`[Vantage] ↩ ${slug} ATTEMPTED — recorded:`, result.recorded);
                    if (result.recorded) flashBadge('↩', '#6366f1');
                }
            } catch (err) {
                console.warn('[Vantage] Attempt sync error:', err.message);
            }
        })();
        return false;
    }

    // ── Legacy: popup-initiated bulk sync ─────────────────────────────────────
    if (msg.action === 'syncWithBackend') {
        (async () => {
            try {
                await postSolved(msg.lcusername, msg.leetcodeSlugs);
            } catch (err) {
                console.error('[Vantage] Bulk sync error:', err.message);
            }
        })();
        return false;
    }
});