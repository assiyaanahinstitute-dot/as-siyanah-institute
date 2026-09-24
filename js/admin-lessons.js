document.addEventListener("DOMContentLoaded", async function () {

    const lessonsTableBody =
        document.getElementById("lessonsTableBody");

    const lessonsMessage =
        document.getElementById("lessonsMessage");

    const searchInput =
        document.getElementById("lessonSearch");

    let lessons = [];


    // =========================
    // CHECK ADMIN LOGIN
    // =========================

    const { data: sessionData } =
        await supabaseClient.auth.getSession();

    if (!sessionData.session) {
        window.location.href = "admin-login.html";
        return;
    }


    // =========================
    // LOAD LESSONS
    // =========================

    async function loadLessons() {

        lessonsMessage.textContent =
            "Loading lessons...";


        const { data, error } =
            await supabaseClient
                .from("Lessons")
                .select(`
                    id,
                    title,
                    description,
                    subject,
                    level,
                    video_url,
                    published
                `)
                .order("id", {
                    ascending: true
                });


        if (error) {

            console.error(
                "Lesson loading error:",
                error
            );

            lessonsMessage.textContent =
                "Unable to load lessons: " +
                error.message;

            return;
        }


        lessons = data || [];


        lessonsMessage.textContent =
            lessons.length +
            " lesson(s) found.";


        displayLessons(lessons);
    }


    // =========================
    // DISPLAY LESSONS
    // =========================

    function displayLessons(list) {

        lessonsTableBody.innerHTML = "";


        if (!list.length) {

            lessonsTableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        No lessons found.
                    </td>
                </tr>
            `;

            return;
        }


        list.forEach(function (lesson) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${lesson.id || "N/A"}
                </td>

                <td>
                    ${lesson.title || "N/A"}
                </td>

                <td>
                    ${lesson.subject || "N/A"}
                </td>

                <td>
                    ${lesson.level || "N/A"}
                </td>

                <td>
                    ${
                        lesson.published
                            ? "Published"
                            : "Draft"
                    }
                </td>

                <td>

                    <button
                        type="button"
                        class="lesson-view-button"
                        data-id="${lesson.id}"
                    >
                        View
                    </button>

                </td>
            `;


            lessonsTableBody.appendChild(row);

        });

    }


    // =========================
    // SEARCH
    // =========================

    searchInput.addEventListener(
        "input",
        function () {

            const search =
                searchInput.value
                    .toLowerCase()
                    .trim();


            const filtered =
                lessons.filter(function (lesson) {

                    return (

                        (lesson.title || "")
                            .toLowerCase()
                            .includes(search)

                        ||

                        (lesson.subject || "")
                            .toLowerCase()
                            .includes(search)

                        ||

                        (lesson.level || "")
                            .toLowerCase()
                            .includes(search)

                    );

                });


            displayLessons(filtered);

        }
    );


    // =========================
    // VIEW LESSON
    // =========================

    lessonsTableBody.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".lesson-view-button"
                );

            if (!button) {
                return;
            }


            const lessonId =
                button.getAttribute("data-id");


            if (!lessonId) {
                console.error(
                    "No lesson ID found."
                );
                return;
            }


            window.location.assign(
                "admin-lesson-view.html?id=" +
                encodeURIComponent(lessonId)
            );

        }
    );


    // =========================
    // START
    // =========================

    await loadLessons();

});