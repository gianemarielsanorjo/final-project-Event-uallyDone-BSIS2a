
// AUTOMATIC API URL FOR LOCAL AND LIVE DEPLOYMENT
const API_URL = `${window.location.origin}/api/auth`;

const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");
const loginButton = document.getElementById("loginButton");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    message.className = "alert d-none";
    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Login failed.");
        }

        if (!data.token || !data.user) {
            throw new Error("Authentication information is incomplete.");
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        message.textContent = "Login successful! Redirecting...";
        message.className = "alert alert-success";

        // ROLE-BASED DASHBOARD REDIRECTION
        switch (data.user.role) {
            case "Student":
                window.location.href = "/student-dashboard.html";
                break;

            case "Event Organizer":
                window.location.href = "/organizer-dashboard.html";
                break;

            case "Admin":
                window.location.href = "/admin-dashboard.html";
                break;

            default:
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                throw new Error("Invalid user role. Please contact the administrator.");
        }

    } catch (error) {
        message.textContent = error.message || "Unable to connect to the server.";
        message.className = "alert alert-danger";

        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }
});
