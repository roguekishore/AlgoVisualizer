// Handles real-time solve detection from content-script.js.
// The popup fetches the backend directly, so this only handles
// fire-and-forget single-problem syncs on LeetCode submission pages.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "syncWithBackend") {
        // Change this URL when you deploy to Render
        const SPRING_BOOT_URL = "http://localhost:8080/api/sync";

        fetch(SPRING_BOOT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                lcusername: request.lcusername,
                leetcodeSlugs: request.leetcodeSlugs
            })
        })
        .then(res => res.ok
            ? res.json().then(d => console.log("Sync ok:", d))
            : res.text().then(t => console.warn("Sync error:", t))
        )
        .catch(err => console.error("Backend unreachable:", err));

        // No sendResponse needed — content-script doesn't wait for a reply
    }
});