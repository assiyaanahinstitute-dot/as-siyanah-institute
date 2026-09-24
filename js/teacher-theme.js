/* =========================================================
   AS-SIYĀNAH TEACHER PORTAL
   GLOBAL THEME SYSTEM
========================================================= */

(function () {

    const STORAGE_KEY = "as-siyanah-teacher-theme";

    function applyTheme() {

        const savedTheme =
            localStorage.getItem(STORAGE_KEY);

        if (savedTheme === "dark") {

            document.documentElement.classList.add(
                "teacher-dark"
            );

        } else {

            document.documentElement.classList.remove(
                "teacher-dark"
            );

        }

    }


    function updateThemeButtons() {

        const buttons =
            document.querySelectorAll(".teacher-theme-toggle");

        const isDark =
            document.documentElement.classList.contains(
                "teacher-dark"
            );


        buttons.forEach(button => {

            button.innerHTML = isDark
                ? "☀️ Light Mode"
                : "🌙 Dark Mode";

            button.setAttribute(
                "aria-label",
                isDark
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            );

        });

    }


    function toggleTheme() {

        const isDark =
            document.documentElement.classList.toggle(
                "teacher-dark"
            );


        localStorage.setItem(
            STORAGE_KEY,
            isDark ? "dark" : "light"
        );


        updateThemeButtons();

    }


    /* Apply before page is fully displayed */
    applyTheme();


    document.addEventListener(
        "DOMContentLoaded",
        function () {

            document
                .querySelectorAll(
                    ".teacher-theme-toggle"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        toggleTheme
                    );

                });


            updateThemeButtons();

        }
    );

})();



