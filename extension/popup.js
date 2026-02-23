const SPRING_BOOT_URL = "http://localhost:8080/api/sync";
const LC_GRAPHQL     = "https://leetcode.com/graphql";

// ── Helpers ──────────────────────────────────────────────────────────────────

async function lcQuery(query, variables = {}) {
    const res = await fetch(LC_GRAPHQL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables })
    });
    if (!res.ok) throw new Error("LeetCode request failed: " + res.status);
    return res.json();
}

// ── Main sync flow ────────────────────────────────────────────────────────────

document.getElementById("syncBtn").addEventListener("click", async () => {
    const btn    = document.getElementById("syncBtn");
    const status = document.getElementById("status");

    btn.disabled      = true;
    status.style.color = "";
    status.innerText  = "Checking LeetCode session...";

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
            status.innerText   = "❌ Please log in to LeetCode first";
            status.style.color = "red";
            btn.disabled       = false;
            return;
        }

        // Cache the lcusername for the content-script
        chrome.storage.local.set({ lcusername: username });

        status.innerText = `Found: @${username} — fetching solves...`;

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
        status.innerText = `Forwarding ${slugs.length} problems to backend...`;

        // 3. Push directly to our backend (avoids MV3 service worker lifetime issues)
        try {
            const backendRes = await fetch("http://localhost:8080/api/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lcusername: username, leetcodeSlugs: slugs })
            });

            if (backendRes.ok) {
                const data = await backendRes.json();
                status.innerText   = `✅ ${data.updated} newly solved / ${data.matched} matched`;
                status.style.color = "green";
            } else {
                const errText = await backendRes.text();
                status.innerText   = `❌ ${errText}`;
                status.style.color = "red";
                btn.disabled       = false;
            }
        } catch (fetchErr) {
            console.error("Backend unreachable:", fetchErr);
            status.innerText   = "❌ Backend offline — is the server running?";
            status.style.color = "red";
            btn.disabled       = false;
        }

    } catch (err) {
        console.error(err);
        status.innerText   = "❌ Error: " + err.message;
        status.style.color = "red";
        btn.disabled       = false;
    }
});