
const token = localStorage.getItem("token");

const profileMessage = document.getElementById("profileMessage");
const profileContent = document.getElementById("profileContent");
const profileNavigation = document.getElementById("profileNavigation");

async function loadProfile() {

    if (!token) {
        window.location.replace("/login.html");
        return;
    }

    try {
        const response = await fetch("/api/auth/profile", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            },
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Unable to load account information.");
        }

        const data = await response.json();
        const user = data.user;

        if (!user) {
            throw new Error("User information not found.");
        }

        // DISPLAY ACTUAL DATABASE INFORMATION
        const name = user.full_name || "No name available";
        const email = user.email || "No email available";
        const role = user.role || "Unknown";

        document.getElementById("displayName").textContent = name;
        document.getElementById("displayEmail").textContent = email;
        document.getElementById("displayRole").textContent = role;

        document.getElementById("infoName").textContent = name;
        document.getElementById("infoEmail").textContent = email;
        document.getElementById("infoRole").textContent = role;

        document.getElementById("profileAvatar").textContent =
            name.charAt(0).toUpperCase();

        // ROLE-BASED NAVIGATION
        let navigation = "";

        if (role === "Student") {
            navigation = `
                <a class="nav-link" href="/student-dashboard.html">Dashboard</a>
                <a class="nav-link" href="/items.html">Inventory</a>
                <a class="nav-link" href="/reservations.html">My Reservations</a>
                <a class="nav-link active" href="/profile.html">My Profile</a>
                <a class="nav-link" href="#" id="logoutLink">Logout</a>
            `;
        } else if (role === "Event Organizer") {
            navigation = `
                <a class="nav-link" href="/organizer-dashboard.html">Dashboard</a>
                <a class="nav-link" href="/items.html">Inventory</a>
                <a class="nav-link" href="/reservations.html">Reservations</a>
                <a class="nav-link" href="/checklists.html">Checklists</a>
                <a class="nav-link active" href="/profile.html">My Profile</a>
                <a class="nav-link" href="#" id="logoutLink">Logout</a>
            `;
        } else if (role === "Admin") {
            navigation = `
                <a class="nav-link" href="/admin-dashboard.html">Dashboard</a>
                <a class="nav-link" href="/items.html">Inventory</a>
                <a class="nav-link" href="/reservations.html">Reservations</a>
                <a class="nav-link" href="/checklists.html">Checklists</a>
                <a class="nav-link active" href="/profile.html">My Profile</a>
                <a class="nav-link" href="#" id="logoutLink">Logout</a>
            `;
        } else {
            throw new Error("Invalid account role.");
        }

        profileNavigation.innerHTML = navigation;

        // LOGOUT
        document.getElementById("logoutLink").addEventListener("click", function(event) {
            event.preventDefault();

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            sessionStorage.clear();

            window.location.replace("/login.html");
        });

        // SAVE VERIFIED USER INFORMATION
        localStorage.setItem("user", JSON.stringify(user));

        profileMessage.style.display = "none";
        profileContent.style.display = "flex";

    } catch (error) {
        console.error("Profile error:", error);

        profileMessage.className = "alert alert-danger";
        profileMessage.textContent =
            "Unable to load your profile. Please login again.";

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setTimeout(() => {
            window.location.replace("/login.html");
        }, 1500);
    }
}

loadProfile();
