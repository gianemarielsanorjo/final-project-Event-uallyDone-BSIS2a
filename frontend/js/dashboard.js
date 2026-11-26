

// GET LOGGED-IN USER
let user = null;

try {
    user = JSON.parse(localStorage.getItem("user") || "null");
} catch (error) {
    console.error("Unable to read user information:", error);
}

const token = localStorage.getItem("token");

const userName = document.getElementById("userName");
const message = document.getElementById("message");
const apiStatus = document.getElementById("apiStatus");

if (!token || !user) {
    window.location.replace("/login.html");
}

if (userName) {
    userName.textContent = user.full_name || "Guest";
}


// LOAD DASHBOARD DATA
async function loadDashboard() {
    try {
        const headers = {
            Authorization: `Bearer ${token}`
        };

        const [itemsResponse, reservationsResponse] =
            await Promise.all([
                fetch("/api/items"),
                fetch("/api/reservations", { headers })
            ]);

        if (itemsResponse.status === 401 ||
            reservationsResponse.status === 401) {
            logout();
            return;
        }

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

        const totalItemsElement = document.getElementById("totalItems");
        const totalReservationsElement = document.getElementById("totalReservations");

        if (totalItemsElement) {
            totalItemsElement.textContent = items.length;
        }

        if (totalReservationsElement) {
            totalReservationsElement.textContent = reservations.length;
        }

        if (message) {
            message.className = "alert alert-success";
            message.textContent = "Dashboard loaded successfully!";
        }

        if (apiStatus) {
            apiStatus.textContent =
                "Connected to EVENT-UALLY DONE API.";
        }

    } catch (error) {
        if (message) {
            message.className = "alert alert-warning";
            message.textContent = error.message;
        }

        if (apiStatus) {
            apiStatus.textContent =
                "Some dashboard data could not be loaded.";
        }

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
const logoutLink = document.getElementById("logoutLink");

if (logoutLink) {
    logoutLink.addEventListener("click", logout);
}


// START DASHBOARD
if (token && user) {
    loadDashboard();
}
