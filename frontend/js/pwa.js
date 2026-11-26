
if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
        try {
            const registration = await navigator.serviceWorker.register("/sw.js");
            console.log("PWA Service Worker registered:", registration.scope);
        } catch (error) {
            console.error("Service Worker registration failed:", error);
        }
    });
}
