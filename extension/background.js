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
async function postSolved(lcusername, slugs) {
    const res = await fetch(BACKEND_SYNC, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ lcusername, leetcodeSlugs: slugs }),
    });
    if (!res.ok) throw new Error((await res.text()) || `HTTP ${res.status}`);
    return res.json();
}

async function postAttempt(lcusername, lcslug) {
    const res = await fetch(BACKEND_ATTEMPT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
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