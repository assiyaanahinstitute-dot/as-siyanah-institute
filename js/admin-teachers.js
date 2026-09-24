document.addEventListener("DOMContentLoaded", async function () {

    const teachersTableBody =
        document.getElementById("teachersTableBody");

    const teachersMessage =
        document.getElementById("teachersMessage");

    const searchInput =
        document.getElementById("teacherSearch");

    let teachers = [];


    // Check admin login
    const { data: sessionData } =
        await supabaseClient.auth.getSession();

    if (!sessionData.session) {
        window.location.href = "admin-login.html";
        return;
    }


    // Load teachers
    async function loadTeachers() {

        teachersMessage.textContent =
            "Loading teachers...";

        const { data, error } =
            await supabaseClient
                .from("Teachers")
                .select(`
                    id,
                    full_name,
                    email,
                    role,
                    created_at
                `)
                .order("id", {
                    ascending: true
                });


        if (error) {

            console.error(error);

            teachersMessage.textContent =
                "Unable to load teachers: " +
                error.message;

            return;
        }


        teachers = data || [];

        teachersMessage.textContent =
            teachers.length +
            " teacher(s) found.";

        displayTeachers(teachers);
    }


    // Display teachers
    function displayTeachers(list) {

        teachersTableBody.innerHTML = "";


        if (!list.length) {

            teachersTableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        No teachers found.
                    </td>
                </tr>
            `;

            return;
        }


        list.forEach(function (teacher) {

            const row =
                document.createElement("tr");


            const joinedDate =
                teacher.created_at
                    ? new Date(
                        teacher.created_at
                    ).toLocaleDateString(
                        "en-GB",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    )
                    : "N/A";


            row.innerHTML = `

                <td>
                    ${teacher.id || "N/A"}
                </td>

                <td>
                    ${teacher.full_name || "N/A"}
                </td>

                <td>
                    ${teacher.email || "N/A"}
                </td>

                <td>
                    ${teacher.role || "N/A"}
                </td>

                <td>
                    ${joinedDate}
                </td>

                <td>

                    <button
                        type="button"
                        class="teacher-view-button"
                        data-id="${teacher.id}"
                    >
                        View
                    </button>

                </td>

            `;


            teachersTableBody.appendChild(row);

        });

    }


    // Search
    searchInput.addEventListener(
        "input",
        function () {

            const search =
                searchInput.value
                    .toLowerCase()
                    .trim();


            const filtered =
                teachers.filter(function (teacher) {

                    return (
                        (teacher.full_name || "")
                            .toLowerCase()
                            .includes(search)

                        ||

                        (teacher.email || "")
                            .toLowerCase()
                            .includes(search)

                        ||

                        (teacher.role || "")
                            .toLowerCase()
                            .includes(search)
                    );

                });


            displayTeachers(filtered);

        }
    );


    // View teacher
    teachersTableBody.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".teacher-view-button"
                );

            if (!button) {
                return;
            }


            const teacherId =
                button.dataset.id;


            window.location.href =
                "admin-teacher-view.html?id=" +
                teacherId;

        }
    );


    await loadTeachers();

});