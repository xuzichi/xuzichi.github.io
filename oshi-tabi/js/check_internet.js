function checkInternet() {
    return new Promise((resolve) => {
        // Try fetching a reliable URL to check actual connectivity
        fetch("https://www.google.com", { mode: "no-cors" })
            .then(() => resolve(true))
            .catch(() => resolve(false));
    });
}

// Function to update status
async function updateConnectionStatus() {
    const isConnected = await checkInternet();
    if (isConnected) {
        console.log("✅ You are ONLINE!");
        hideLoadingScreen();
    } else {
        console.log("❌ You are OFFLINE!");
        showLoadingScreen("インターネットに接続されていません。");
    }
}

// Immediate check when script runs
updateConnectionStatus();

// Listen for connectivity changes
window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);
