
const API_URL = `${window.location.origin}/api/auth`;

const registerForm = document.getElementById("registerForm");
const message = document.getElementById("message");
const registerButton = document.getElementById("registerButton");

registerForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const full_name = document.getElementById("full_name").value.trim();
    const email = document.getElementById("email").value.trim();
    const role = document.getElementById("role").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    message.className = "alert d-none";

    if (!role) {
        message.textContent = "Please select a user role.";
        message.className = "alert alert-danger";
        return;
    }

    if (!["Student", "Event Organizer"].includes(role)) {
        message.textContent = "Invalid registration role.";
        message.className = "alert alert-danger";
        return;
    }

    if (password !== confirmPassword) {
        message.textContent = "Passwords do not match.";
        message.className = "alert alert-danger";
        return;
    }

    registerButton.disabled = true;
    registerButton.textContent = "Creating account...";

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                full_name,
                email,
                role,
                password,
                confirmPassword
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const validationMessage = data.errors
                ? data.errors.map(error => error.msg).join(" ")
                : data.message;

            throw new Error(validationMessage || "Registration failed.");
        }

        message.textContent = "Registration successful! Redirecting to login...";
        message.className = "alert alert-success";

        registerForm.reset();

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } catch (error) {
        message.textContent = error.message || "Unable to connect to the server.";
        message.className = "alert alert-danger";

    } finally {
        registerButton.disabled = false;
        registerButton.textContent = "Create Account";
    }
});
