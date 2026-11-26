
(async function protectStudentDashboard() {
    const token = localStorage.getItem("token");
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    // CHECK LOGIN
    if (!token || !storedUser) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.replace("/login.html");
        return;
    }

    try {
        // VERIFY USER THROUGH BACKEND
        const response = await fetch("/api/auth/profile", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Authentication failed. Please login again.");
        }

        const data = await response.json();
        const user = data.user;

        // CHECK IF USER IS A STUDENT
        if (!user || user.role !== "Student") {

            if (user?.role === "Admin") {
                window.location.replace("/admin-dashboard.html");
            } 
            else if (user?.role === "Event Organizer") {
                window.location.replace("/organizer-dashboard.html");
            } 
            else {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.replace("/login.html");
            }

            return;
        }

        // UPDATE SAVED USER INFORMATION
        localStorage.setItem("user", JSON.stringify(user));

        // GET STUDENT NAME
        const studentName = user.full_name || "Student";

        // DISPLAY NAME IN DASHBOARD
        const userName = document.getElementById("userName");
        const welcomeName = document.getElementById("welcomeName");

        if (userName) {
            userName.textContent = studentName;
        }

        if (welcomeName) {
            welcomeName.textContent = studentName;
        }

    } catch (error) {
        console.error("Student authentication error:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.replace("/login.html");
    }
})();
