const SPRING_BOOT_URL = "http://localhost:8080/api/sync";
const LC_GRAPHQL      = "https://leetcode.com/graphql";

// ── Helpers ──────────────────────────────────────────────────────────────────

async function lcQuery(query, variables = {}) {
    const res = await fetch(LC_GRAPHQL, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables })
    });
    if (!res.ok) throw new Error("LeetCode request failed: " + res.status);
    return res.json();
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function setStatus(text, state = "idle") {
    const box    = document.getElementById("statusBox");
    const textEl = document.getElementById("statusText");
    box.className      = "status " + state;
    textEl.textContent = text;
}

function setBusy(busy) {
    const btn     = document.getElementById("syncBtn");
    const spinner = document.getElementById("btnSpinner");
    const icon    = document.getElementById("btnIcon");
    const label   = document.getElementById("btnLabel");

    btn.disabled          = busy;
    spinner.style.display = busy ? "block" : "none";
    icon.style.display    = busy ? "none"  : "block";
    label.textContent     = busy ? "Syncing..." : "Sync Now";
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

// ── Auth status (runs on popup open) ─────────────────────────────────────────

async function checkAuthStatus() {
    // Restore linked username from storage immediately
    const { lcusername: linked } = await chrome.storage.local.get(["lcusername"]);
    setLinkedUser(linked || null);

    if (!linked) {
        setAuthChip("—", "");
        setSessionUser(null);
        return;
    }

    // Live-check who is currently logged in on LeetCode
    try {
        const data = await lcQuery(`query userStatus { userStatus { username isSignedIn } }`);
        const { username, isSignedIn } = data.data.userStatus;

        if (!isSignedIn || !username) {
            setSessionUser(null);
            setAuthChip("not signed in", "mismatch");
            setStatus("Sign in to LeetCode to enable auto-sync.", "fail");
            return;
        }

        setSessionUser(username);

        if (username.toLowerCase() === linked.toLowerCase()) {
            setAuthChip("✓ match", "match");
            // Clear any previous mismatch warning
            setStatus("Ready to sync", "idle");
        } else {
            setAuthChip("⚠ mismatch", "mismatch");
            setStatus(
                `LeetCode session is @${username} but the app is linked to @${linked}. ` +
                `Auto-sync is blocked. Re-link by clicking Sync Now, or log in to LeetCode as @${linked}.`,
                "fail"
            );
        }
    } catch {
        setSessionUser(null);
        setAuthChip("offline", "");
    }
}

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
        chrome.storage.local.set({ lcusername: username });
        setSessionUser(username);
        setLinkedUser(username);
        setAuthChip("✓ match", "match");

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

        // 3. Push directly to our backend
        try {
            const backendRes = await fetch(SPRING_BOOT_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lcusername: username, leetcodeSlugs: slugs })
            });

            if (backendRes.ok) {
                const data = await backendRes.json();
                setStatus(`${data.updated} newly synced  ·  ${data.matched} matched on map`, "ok");
                setBusy(false);
            } else {
                const errText = await backendRes.text();
                setStatus(errText || "Backend returned an error.", "fail");
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
