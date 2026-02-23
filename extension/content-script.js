console.log("DSA World Map Live Tracker Active...");

let lastSolved = "";

const observer = new MutationObserver(() => {
    // Look for the "Accepted" status on the submission page
    const successElement = document.querySelector('[data-e2e-locator="submission-result"]');
    
    if (successElement && successElement.innerText.includes("Accepted")) {
        const slug = window.location.pathname.split('/')[2];
        
        // Prevent duplicate pings for the same submission session
        if (slug !== lastSolved) {
            lastSolved = slug;
            console.log("Detection: " + slug + " solved!");

            // Read the lcusername cached by popup.js, then send sync
            chrome.storage.local.get(["lcusername"], (result) => {
                const lcusername = result.lcusername;
                if (!lcusername) {
                    console.warn("DSA Sync: no lcusername cached. Open the extension popup and sync first.");
                    return;
                }
                chrome.runtime.sendMessage({
                    action: "syncWithBackend",
                    lcusername: lcusername,
                    leetcodeSlugs: [slug]
                });
            });
        }
    }
});

observer.observe(document.body, { childList: true, subtree: true });