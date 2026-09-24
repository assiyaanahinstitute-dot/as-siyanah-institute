// ========================================
// AS-SIYĀNAH THEME SYSTEM
// Dark Mode / Light Mode
// ========================================

(function () {

    const savedTheme = localStorage.getItem("as-siyanah-theme");

    // Apply saved theme immediately
    if (savedTheme === "dark") {
        document.documentElement.classList.add("dark-mode");
    }

    function updateThemeButton() {

        const buttons = document.querySelectorAll(".theme-toggle");

        const isDark = document.documentElement.classList.contains("dark-mode");

        buttons.forEach(button => {

            button.innerHTML = isDark
                ? '<span>☀️</span> Light Mode'
                : '<span>🌙</span> Dark Mode';

            button.setAttribute(
                "aria-label",
                isDark ? "Switch to light mode" : "Switch to dark mode"
            );

        });
    }

    function toggleTheme() {

        const isDark =
            document.documentElement.classList.toggle("dark-mode");

        localStorage.setItem(
            "as-siyanah-theme",
            isDark ? "dark" : "light"
        );

        updateThemeButton();
    }

    document.addEventListener("DOMContentLoaded", function () {

        document
            .querySelectorAll(".theme-toggle")
            .forEach(button => {
                button.addEventListener("click", toggleTheme);
            });

        updateThemeButton();

    });

})();