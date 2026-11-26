
// GET LOGGED-IN USER
let user = null;

try {
    user = JSON.parse(localStorage.getItem("user") || "null");
} catch (error) {
    console.error("Unable to read user information:", error);
}

document.getElementById("userName").textContent =
    user && user.full_name ? user.full_name : "Guest";


// LOAD DASHBOARD DATA
async function loadDashboard() {

    const message = document.getElementById("message");
    const apiStatus = document.getElementById("apiStatus");

    try {

        const [itemsResponse, reservationsResponse] =
            await Promise.all([
                fetch("/api/items"),
                fetch("/api/reservations")
            ]);

        if (!itemsResponse.ok) {
            throw new Error("Unable to load inventory items.");
        }

        if (!reservationsResponse.ok) {
            throw new Error("Unable to load reservations.");
        }

        const items = await itemsResponse.json();
        const reservations = await reservationsResponse.json();

        if (!Array.isArray(items) || !Array.isArray(reservations)) {
            throw new Error("Invalid dashboard data received.");
        }

        document.getElementById("totalItems").textContent =
            items.length;

        document.getElementById("totalReservations").textContent =
            reservations.length;

        message.className = "alert alert-success";
        message.textContent = "Dashboard loaded successfully!";

        apiStatus.textContent =
            "Connected to EVENT-UALLY DONE API.";

    } catch (error) {

        message.className = "alert alert-warning";
        message.textContent = error.message;

        apiStatus.textContent =
            "Some dashboard data could not be loaded.";

        console.error("Dashboard Error:", error);
    }
}


// LOGOUT
function logout(event) {

    if (event) {
        event.preventDefault();
    }

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    window.location.replace("/login.html");
}


// LOGOUT BUTTON EVENT
document.getElementById("logoutLink").addEventListener("click", logout);


// START DASHBOARD
loadDashboard();
