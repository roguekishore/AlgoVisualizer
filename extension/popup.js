const SPRING_BOOT_URL = "http://localhost:8080/api/sync";
const SPRING_BOOT_USER = "http://localhost:8080/api/users";
const LC_GRAPHQL      = "https://leetcode.com/graphql";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Query the LeetCode GraphQL API with automatic retry + exponential back-off.
 * LeetCode returns 499 (rate-limit / "client closed request") when requests
 * arrive too quickly.  Retrying after a short pause resolves it every time.
 */
async function lcQuery(query, variables = {}, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        const res = await fetch(LC_GRAPHQL, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, variables })
        });

        if (res.ok) return res.json();

        // Retry on 429 (Too Many Requests) or LeetCode's non-standard 499
        if ((res.status === 429 || res.status === 499) && attempt < retries) {
            const wait = 1000 * attempt;           // 1s, 2s, 3s …
            console.warn(`[Vantage] LeetCode ${res.status} — retry ${attempt}/${retries} in ${wait}ms`);
            await new Promise(r => setTimeout(r, wait));
            continue;
        }

        throw new Error("LeetCode request failed: " + res.status);
    }
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function setStatus(text, state = "idle") {
    const box    = document.getElementById("statusBox");
    const textEl = document.getElementById("statusText");
    box.className      = "status " + state;
    textEl.textContent = text;
}

// Tracks whether the button is auth-locked (mismatch / not signed in / etc.)
// so setBusy(false) can restore the correct state after a sync attempt.
let _syncLocked = false;

function setBusy(busy) {
    const btn     = document.getElementById("syncBtn");
    const spinner = document.getElementById("btnSpinner");
    const icon    = document.getElementById("btnIcon");
    const label   = document.getElementById("btnLabel");

    // When finishing, restore the locked state instead of blindly enabling.
    btn.disabled          = busy ? true : _syncLocked;
    spinner.style.display = busy ? "block" : "none";
    icon.style.display    = busy ? "none"  : "block";
    label.textContent     = busy ? "Syncing..." : "Sync Now";
}

/** Lock or unlock the sync button independently of the busy spinner. */
function setSyncDisabled(disabled, reason = "") {
    _syncLocked = disabled;
    const btn = document.getElementById("syncBtn");
    btn.disabled = disabled;
    btn.title    = disabled ? reason : "";
}

/** Update the "LC Session" row (current LeetCode login). */
function setSessionUser(username) {
    const el  = document.getElementById("lcUser");
    const dot = document.getElementById("lcDot");
    if (username) {
        el.textContent = "@" + username;
        el.classList.remove("empty");
        dot.classList.add("on");
    } else {
        el.textContent = "Not detected";
        el.classList.add("empty");
        dot.classList.remove("on");
    }
}

/** Update the "App Linked" row (stored lcusername). */
function setLinkedUser(username) {
    const el = document.getElementById("appLinkedUser");
    if (username) {
        el.textContent = "@" + username;
        el.classList.remove("empty");
    } else {
        el.textContent = "Not synced";
        el.classList.add("empty");
    }
}

/** Update the auth match chip. state: 'match' | 'mismatch' | '' */
function setAuthChip(label, state = "") {
    const chip = document.getElementById("authChip");
    chip.textContent = label;
    chip.className   = "auth-chip" + (state ? " " + state : "");
}

/** Show or hide the sign-in prompt banner. */
function showSignInPrompt(show) {
    const el = document.getElementById("signinPrompt");
    el.style.display = show ? "block" : "none";
}

// ── Auth status (runs on popup open) ─────────────────────────────────────────

/**
 * Fetch the user profile from the backend by uid.
 * Returns the UserResponseDTO (which contains the latest lcusername)
 * or null if the user doesn't exist / backend is offline.
 */
async function fetchLinkedProfile(uid) {
    const res = await fetch(`${SPRING_BOOT_USER}/${uid}`);
    if (!res.ok) return null;
    return res.json();          // { uid, username, email, lcusername, ... }
}

/**
 * Ask the content-script in a localhost:3000 tab to read localStorage
 * directly and return the current user data.  This bypasses chrome.storage
 * completely — it's a synchronous request → response over chrome.tabs.
 */
async function fetchUserFromContentScript() {
    try {
        const tabs = await chrome.tabs.query({ url: 'http://localhost:3000/*' });
        for (const tab of tabs) {
            try {
                const resp = await chrome.tabs.sendMessage(
                    tab.id, { action: 'getUserFromLocalStorage' });
                if (resp && resp.uid != null) {
                    console.log('[Vantage] Got user directly from content-script:', resp);
                    return resp;   // { lcusername, uid, sessionToken }
                }
            } catch { /* content-script not ready in this tab */ }
        }
    } catch (err) {
        console.warn('[Vantage] Tab query failed:', err);
    }
    return null;
}

async function checkAuthStatus() {
    // chrome.storage now stores uid, lcusername, and sessionToken, kept fresh
    // by the content-script running on localhost:3000.
    let { lcusername: storedLc, uid: storedUid, sessionToken: storedToken } =
        await chrome.storage.local.get(['lcusername', 'uid', 'sessionToken']);

    // ── Fallback: if chrome.storage is empty, ask the content-script directly
    if (storedUid == null) {
        const direct = await fetchUserFromContentScript();
        if (direct && direct.uid != null) {
            storedUid   = direct.uid;
            storedLc    = direct.lcusername;
            storedToken = direct.sessionToken;
            // Persist to chrome.storage so future opens are instant
            const update = { uid: storedUid };
            if (storedLc) update.lcusername = storedLc;
            if (storedToken) update.sessionToken = storedToken;
            chrome.storage.local.set(update);
        }
    }

    // ── Validate stored values against the backend ────────────────────────
    let linked = null;          // the CONFIRMED lcusername from backend
    let backendOnline = true;

    if (storedUid != null) {
        try {
            const profile = await fetchLinkedProfile(storedUid);
            if (profile) {
                if (profile.lcusername) {
                    linked = profile.lcusername;

                    // If the backend's lcusername differs from what we cached
                    // (e.g. user changed it on their profile page), update storage.
                    if (linked !== storedLc) {
                        chrome.storage.local.set({ lcusername: linked });
                    }
                } else {
                    // User exists but hasn't set an lcusername yet — keep uid
                    // and sessionToken so the popup knows they're logged in.
                    if (storedLc) chrome.storage.local.remove(['lcusername']);
                }
            } else {
                // User doesn't exist in backend (deleted?) — clear everything
                chrome.storage.local.remove(['lcusername', 'uid', 'sessionToken']);
            }
        } catch {
            backendOnline = false;
        }
    } else if (storedLc) {
        // Legacy path: only lcusername in storage (no uid).
        // Can happen if the content-script hasn't re-synced yet.
        // Fall back to the old "does this lcusername exist?" check.
        try {
            const res = await fetch(SPRING_BOOT_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lcusername: storedLc, leetcodeSlugs: [] }),
            });
            if (res.ok) {
                linked = storedLc;
            } else {
                chrome.storage.local.remove(['lcusername', 'uid', 'sessionToken']);
            }
        } catch {
            backendOnline = false;
        }
    }

    // ── Detect the live LeetCode session ─────────────────────────────────
    // Primary: read the cached value written by the content-script running
    // inside an actual LeetCode tab (has full cookie access → reliable).
    // Fallback: try a direct GraphQL query from the popup (unreliable in
    // MV3 because the popup's origin can't always attach LC cookies).
    let lcSessionUser = null;
    try {
        const { lcSessionUser: cached } =
            await chrome.storage.local.get(['lcSessionUser']);
        if (cached) {
            lcSessionUser = cached;
        } else {
            // No cached value — try direct query as a fallback
            const data = await lcQuery(
                `query userStatus { userStatus { username isSignedIn } }`);
            const { username, isSignedIn } = data.data.userStatus;
            if (isSignedIn && username) lcSessionUser = username;
        }
    } catch { /* LeetCode unreachable and nothing cached */ }
    setSessionUser(lcSessionUser);

    // ── Update UI ─────────────────────────────────────────────────────────
    if (!backendOnline) {
        setLinkedUser(storedLc || null);
        setAuthChip("offline", "");
        showSignInPrompt(false);
        setStatus("Backend offline — cannot verify linked account.", "fail");
        setSyncDisabled(true, "Backend offline");
        return;
    }

    if (!linked && storedUid == null) {
        setLinkedUser(null);
        showSignInPrompt(true);
        setAuthChip("—", "");
        setStatus("Sign in to the app to enable sync.", "idle");
        setSyncDisabled(true, "Sign in to the app first");
        return;
    }

    if (!linked && storedUid != null) {
        setLinkedUser(null);
        showSignInPrompt(false);
        setAuthChip("no LC", "");
        setStatus("Set your LeetCode username in your profile to enable sync.", "idle");
        setSyncDisabled(true, "No LeetCode username set in your profile");
        return;
    }

    setLinkedUser(linked);
    showSignInPrompt(false);

    if (!lcSessionUser) {
        setAuthChip("not signed in", "mismatch");
        setStatus("Sign in to LeetCode to enable sync.", "fail");
        setSyncDisabled(true, "Sign in to LeetCode first");
    } else if (lcSessionUser.toLowerCase() === linked.toLowerCase()) {
        setAuthChip("✓ match", "match");
        setStatus("Ready to sync", "idle");
        setSyncDisabled(false);
    } else {
        setAuthChip("⚠ mismatch", "mismatch");
        setStatus(
            `LeetCode session (@${lcSessionUser}) doesn't match the app-linked account (@${linked}). ` +
            `Log in to LeetCode as @${linked} to sync.`,
            "fail"
        );
        setSyncDisabled(true, `Switch LeetCode account to @${linked} to sync`);
    }
}

// ── Live-update: re-run auth check whenever chrome.storage changes ───────────
// This catches login/logout events pushed by the content-script while the
// popup is still open.
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (
        changes.lcusername || changes.uid ||
        changes.sessionToken || changes.lcSessionUser
    )) {
        checkAuthStatus();
    }
});

// ── On load: run auth check ───────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
    checkAuthStatus();
});

// ── Main sync flow ────────────────────────────────────────────────────────────

document.getElementById("syncBtn").addEventListener("click", async () => {
    setBusy(true);
    setStatus("Checking LeetCode session...", "busy");

    try {
        // 1. Get the logged-in LeetCode username
        const userData = await lcQuery(`
            query userStatus {
                userStatus {
                    username
                    isSignedIn
                }
            }
        `);

        const { username, isSignedIn } = userData.data.userStatus;

        if (!isSignedIn || !username) {
            setStatus("Please log in to LeetCode first.", "fail");
            setBusy(false);
            return;
        }

        // Cache the lcusername for the content-script and auth guard
        // (persisted to chrome.storage.local only AFTER backend confirms the user exists)
        setSessionUser(username);
        // Also update the cached LC session so the popup always has it
        chrome.storage.local.set({ lcSessionUser: username });

        setStatus(`Found @${username} — fetching accepted solutions...`, "busy");

        // 2. Fetch all accepted problem slugs (up to 3000)
        const solvedData = await lcQuery(`
            query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
                problemsetQuestionList: questionList(categorySlug: $categorySlug, limit: $limit, skip: $skip, filters: $filters) {
                    data { titleSlug }
                }
            }
        `, {
            categorySlug: "",
            skip: 0,
            limit: 3000,
            filters: { status: "AC" }
        });

        const slugs = solvedData.data.problemsetQuestionList.data.map(q => q.titleSlug);
        setStatus(`Forwarding ${slugs.length} solutions to Vantage...`, "busy");

        // 3. Push directly to our backend (with Bearer token for authentication)
        try {
            const { sessionToken } = await chrome.storage.local.get(['sessionToken']);
            const headers = { "Content-Type": "application/json" };
            if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;

            const backendRes = await fetch(SPRING_BOOT_URL, {
                method: "POST",
                headers,
                body: JSON.stringify({ lcusername: username, leetcodeSlugs: slugs })
            });

            if (backendRes.ok) {
                // Backend confirmed — now persist lcusername to chrome.storage.
                const { uid: existingUid, sessionToken: existingToken } =
                    await chrome.storage.local.get(['uid', 'sessionToken']);
                const storageUpdate = { lcusername: username };
                if (existingUid != null) storageUpdate.uid = existingUid;
                if (existingToken) storageUpdate.sessionToken = existingToken;
                chrome.storage.local.set(storageUpdate);

                setLinkedUser(username);
                setAuthChip("✓ match", "match");
                showSignInPrompt(false);

                const data = await backendRes.json();
                setStatus(`${data.updated} newly synced  ·  ${data.matched} matched on map`, "ok");
                setBusy(false);
            } else {
                if (backendRes.status === 404) {
                    setStatus(
                        "LeetCode username not found in your profile. " +
                        "Please sign in to the app and set your LC username first.",
                        "fail"
                    );
                    showSignInPrompt(true);
                } else {
                    const errText = await backendRes.text();
                    setStatus(errText || "Backend returned an error.", "fail");
                }
                setBusy(false);
            }
        } catch (fetchErr) {
            console.error("Backend unreachable:", fetchErr);
            setStatus("Backend offline — is the server running?", "fail");
            setBusy(false);
        }

    } catch (err) {
        console.error(err);
        setStatus("Error: " + err.message, "fail");
        setBusy(false);
    }
});
