const SPRING_BOOT_URL = "http://localhost:8080/api/sync";
const LC_GRAPHQL      = "https://leetcode.com/graphql";

//  Helpers 

async function lcQuery(query, variables = {}) {
    const res = await fetch(LC_GRAPHQL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables })
    });
    if (!res.ok) throw new Error("LeetCode request failed: " + res.status);
    return res.json();
}

//  UI helpers 

function setStatus(text, state = "idle") {
    const box    = document.getElementById("statusBox");
    const textEl = document.getElementById("statusText");
    box.className        = "status " + state;
    textEl.textContent   = text;
}

function setBusy(busy) {
    const btn     = document.getElementById("syncBtn");
    const spinner = document.getElementById("btnSpinner");
    const icon    = document.getElementById("btnIcon");
    const label   = document.getElementById("btnLabel");

    btn.disabled            = busy;
    spinner.style.display   = busy ? "block" : "none";
    icon.style.display      = busy ? "none"  : "block";
    label.textContent       = busy ? "Syncing..." : "Sync Now";
}

function setUser(username) {
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

//  On load: show cached lcusername 

document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.local.get(["lcusername"], ({ lcusername }) => {
        if (lcusername) setUser(lcusername);
    });
});

//  Main sync flow 

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

        // Cache the lcusername for the content-script
        chrome.storage.local.set({ lcusername: username });
        setUser(username);

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

        // 3. Push directly to our backend (avoids MV3 service worker lifetime issues)
        try {
            const backendRes = await fetch(SPRING_BOOT_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lcusername: username, leetcodeSlugs: slugs })
            });

            if (backendRes.ok) {
                const data = await backendRes.json();
                setStatus(`${data.updated} newly synced  ${data.matched} matched on map`, "ok");
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
