
(async function protectChecklistsPage() {
    // HIDE PAGE WHILE VERIFYING ACCESS
    document.documentElement.style.visibility = "hidden";

    const token = localStorage.getItem("token");

    // CHECK LOGIN
    if (!token) {
        localStorage.removeItem("user");
        window.location.replace("/login.html");
        return;
    }

    try {
        // VERIFY TOKEN AND USER ROLE THROUGH BACKEND
        const response = await fetch("/api/auth/profile", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Authentication failed.");
        }

        const data = await response.json();
        const user = data.user;

        if (!user) {
            throw new Error("User information not found.");
        }

        // STUDENTS ARE NOT ALLOWED
        if (user.role === "Student") {
            window.location.replace("/student-dashboard.html");
            return;
        }

        // ONLY ADMIN AND EVENT ORGANIZER
        if (
            user.role !== "Admin" &&
            user.role !== "Event Organizer"
        ) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.replace("/login.html");
            return;
        }

        // UPDATE VERIFIED USER
        localStorage.setItem("user", JSON.stringify(user));

        // SHOW PAGE ONLY AFTER ACCESS IS VERIFIED
        document.documentElement.style.visibility = "visible";

        console.log("Checklist access granted:", user.role);

    } catch (error) {
        console.error("Checklist authentication error:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.replace("/login.html");
    }
})();

