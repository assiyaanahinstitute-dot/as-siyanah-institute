(function () {

    const STORAGE_KEY = "as-siyanah-admin-theme";

    const html = document.documentElement;

    const savedTheme = localStorage.getItem(STORAGE_KEY);

    if (savedTheme === "dark") {
        html.classList.add("admin-dark");
    }


    document.addEventListener("DOMContentLoaded", function () {

        const button =
            document.getElementById("adminThemeToggle");

        if (!button) return;


        updateButton();


        button.addEventListener("click", function () {

            html.classList.toggle("admin-dark");

            const isDark =
                html.classList.contains("admin-dark");

            localStorage.setItem(
                STORAGE_KEY,
                isDark ? "dark" : "light"
            );

            updateButton();

        });


        function updateButton() {

            const isDark =
                html.classList.contains("admin-dark");

            const icon =
                button.querySelector(".admin-theme-icon");

            const text =
                button.querySelector(".admin-theme-text");


            if (isDark) {

                if (icon) icon.textContent = "☀";

                if (text) text.textContent = "Light";

            } else {

                if (icon) icon.textContent = "☾";

                if (text) text.textContent = "Dark";

            }

        }

    });

})();