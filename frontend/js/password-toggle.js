
document.addEventListener("DOMContentLoaded", function () {

    const toggleButtons = document.querySelectorAll("[data-password-toggle]");

    toggleButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            const inputId = button.getAttribute("data-password-toggle");
            const passwordInput = document.getElementById(inputId);

            if (!passwordInput) return;

            const isPassword = passwordInput.type === "password";

            passwordInput.type = isPassword ? "text" : "password";

            const icon = button.querySelector("i");

            if (icon) {
                icon.classList.toggle("bi-eye", !isPassword);
                icon.classList.toggle("bi-eye-slash", isPassword);
            }

            button.setAttribute(
                "aria-label",
                isPassword ? "Hide password" : "Show password"
            );

            button.setAttribute(
                "title",
                isPassword ? "Hide password" : "Show password"
            );

            button.setAttribute(
                "aria-pressed",
                isPassword ? "true" : "false"
            );

        });

    });

});
