/**
 * injected.js — PAGE WORLD (MAIN) script.
 *
 * Runs at document_start in the page's own JavaScript context so it can wrap
 * window.fetch and XMLHttpRequest before LeetCode's React app executes.
 *
 * Detection strategy (same used by LeetHub and similar extensions):
 *  1. Capture the problem slug when LeetCode POSTs to /problems/{slug}/submit/
 *  2. Watch for the polling response from /submissions/detail/{id}/check/
 *  3. When state === "SUCCESS", dispatch a CustomEvent that the isolated-world
 *     content-script.js can safely receive.
 *
 * Auth strategy:
 *  Fetch the current LeetCode session on page load (same-origin, full cookie
 *  access) and dispatch lc-vantage-user so content-script.js can do the
 *  account-match check without touching the background service worker, which
 *  may not have reliable cookie access for external origins.
 */
(function () {
    'use strict';

    // ── URL patterns ──────────────────────────────────────────────────────────
    // LeetCode uses two check polling URL shapes depending on client version:
    //   Old: /submissions/detail/{id}/check/
    //   New: /problems/{slug}/submissions/{id}/check/
    const SUBMIT_RE      = /\/problems\/([^/]+)\/submit\//;
    const CHECK_RE_OLD   = /\/submissions\/detail\/(\d+)\/check\//;
    const CHECK_RE_NEW   = /\/problems\/([^/]+)\/submissions\/\d+\/check\//;
    const CHECK_RE_SLUG  = /\/problems\/([^/]+)\/submissions\//;  // slug capture from new URL

    // Carry the slug from the submit POST to the check response
    let pendingSlug = '';

    // ── Event dispatchers ─────────────────────────────────────────────────────
    function dispatch(detail) {
        window.dispatchEvent(new CustomEvent('lc-vantage-result', { detail }));
    }

    function dispatchUser(detail) {
        window.dispatchEvent(new CustomEvent('lc-vantage-user', { detail }));
    }

    function isCheckUrl(url) {
        return CHECK_RE_OLD.test(url) || CHECK_RE_NEW.test(url);
    }

    function slugFromCheckUrl(url) {
        const m = CHECK_RE_NEW.exec(url);
        return m ? m[1] : null;
    }

    /**
     * Parse the check-polling JSON and dispatch a result event.
     * Only fires when state === "SUCCESS" (i.e., the judge has finished).
     */
    function handleCheckData(data, checkUrl) {
        if (!data) return;
        const state = String(data.state || '').toUpperCase();
        // Some LC clients return terminal states other than SUCCESS (e.g., FAILURE/ERROR).
        // Only ignore clearly non-terminal states.
        if (state && state !== 'SUCCESS' && state !== 'FAILURE' && state !== 'ERROR') return;

        // Prefer slug from new-style URL, then from submit interception, then from page URL
        const slug = (
            slugFromCheckUrl(checkUrl || '') ||
            pendingSlug ||
            window.location.pathname.split('/')[2] ||
            ''
        ).toLowerCase();
        const accepted = data.status_msg === 'Accepted';

        dispatch({
            slug,
            statusMsg:      data.status_msg       ?? '',
            statusCode:     data.status_code       ?? null,
            lang:           data.lang              ?? null,
            questionId:     String(data.question_id ?? ''),
            runtime:        data.runtime           ?? null,
            memory:         data.memory            ?? null,
            totalCorrect:   data.total_correct     ?? null,
            totalTestcases: data.total_testcases   ?? null,
            accepted,
        });

        if (accepted) pendingSlug = '';
    }

    // ── Fetch the current LC session on page load ─────────────────────────────
    // Runs before the main app so the content-script has the username cached
    // by the time the first submission result arrives.
    (function fetchCurrentUser() {
        fetch('/graphql', {
            method:      'POST',
            credentials: 'include',
            headers:     { 'Content-Type': 'application/json' },
            body:        JSON.stringify({
                operationName: 'globalData',
                query: 'query globalData { userStatus { username isSignedIn } }',
                variables: {}
            }),
        })
        .then(r => r.ok ? r.json() : null)
        .then(json => {
            const s = json?.data?.userStatus;
            if (s) dispatchUser({ username: s.username || null, isSignedIn: !!s.isSignedIn });
        })
        .catch(() => dispatchUser({ username: null, isSignedIn: false }));
    })();

    // ── Wrap fetch ────────────────────────────────────────────────────────────
    const _fetch = window.fetch.bind(window);

    window.fetch = async function (input, init, ...rest) {
        const url =
            typeof input === 'string'  ? input :
            input instanceof URL       ? input.href :
            input instanceof Request   ? input.url  : '';

        const submitM = SUBMIT_RE.exec(url);
        if (submitM) pendingSlug = submitM[1];

        const response = await _fetch(input, init, ...rest);

        if (isCheckUrl(url)) {
            response.clone().json().then(data => handleCheckData(data, url)).catch(() => {});
        }

        return response;
    };

    // ── Wrap XMLHttpRequest ───────────────────────────────────────────────────
    const OrigXHR = window.XMLHttpRequest;

    function PatchedXHR() {
        const real  = new OrigXHR();
        let   _xurl = '';

        const origOpen = real.open.bind(real);
        real.open = function (method, url, ...args) {
            _xurl = typeof url === 'string' ? url : '';
            const m = SUBMIT_RE.exec(_xurl);
            if (m) pendingSlug = m[1];
            return origOpen(method, url, ...args);
        };

        real.addEventListener('load', function () {
            if (isCheckUrl(_xurl)) {
                try { handleCheckData(JSON.parse(real.responseText), _xurl); } catch (_) {}
            }
        });

        return real;
    }

    PatchedXHR.prototype = OrigXHR.prototype;
    window.XMLHttpRequest = PatchedXHR;

})();
