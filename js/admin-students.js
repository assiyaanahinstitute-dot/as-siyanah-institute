document.addEventListener("DOMContentLoaded", async function () {

    const studentsTableBody =
        document.getElementById("studentsTableBody");

    const studentsMessage =
        document.getElementById("studentsMessage");

    const searchInput =
        document.getElementById("studentSearch");

    let students = [];


    // ========================================
    // CHECK ADMIN LOGIN
    // ========================================

    const { data: sessionData } =
        await supabaseClient.auth.getSession();

    if (!sessionData.session) {
        window.location.href = "admin-login.html";
        return;
    }


    // ========================================
    // LOAD STUDENTS
    // ========================================

    async function loadStudents() {

        studentsMessage.textContent =
            "Loading students...";

        const { data, error } =
            await supabaseClient
                .from("Student")
                .select(`
                    id,
                    student_id,
                    full_name,
                    programme,
                    level,
                    email,
                    whatsapp
                `)
                .order("id", {
                    ascending: true
                });


        if (error) {

            console.error(
                "Student loading error:",
                error
            );

            studentsMessage.textContent =
                "Unable to load students: " +
                error.message;

            return;
        }


        students = data || [];

        studentsMessage.textContent =
            students.length +
            " student(s) found.";

        displayStudents(students);
    }


    // ========================================
    // DISPLAY STUDENTS
    // ========================================

    function displayStudents(list) {

        studentsTableBody.innerHTML = "";

        if (!list.length) {

            studentsTableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        No students found.
                    </td>
                </tr>
            `;

            return;
        }


        list.forEach(function (student) {

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>
                    ${student.student_id || "N/A"}
                </td>

                <td>
                    ${student.full_name || "N/A"}
                </td>

                <td>
                    ${student.programme || "N/A"}
                </td>

                <td>
                    ${student.level || "N/A"}
                </td>

                <td>
                    ${student.email || "N/A"}
                </td>

                <td>
                    ${student.whatsapp || "N/A"}
                </td>

                <td>

                    <button
                        class="student-view-button"
                        data-id="${student.id}"
                    >
                        View
                    </button>

                </td>

            `;

            studentsTableBody.appendChild(row);

        });

    }


    // ========================================
    // SEARCH STUDENTS
    // ========================================

    searchInput.addEventListener(
        "input",
        function () {

            const search =
                searchInput.value
                    .toLowerCase()
                    .trim();

            const filtered =
                students.filter(function (student) {

                    return (

                        (student.student_id || "")
                            .toLowerCase()
                            .includes(search)

                        ||

                        (student.full_name || "")
                            .toLowerCase()
                            .includes(search)

                        ||

                        (student.email || "")
                            .toLowerCase()
                            .includes(search)

                        ||

                        (student.programme || "")
                            .toLowerCase()
                            .includes(search)

                        ||

                        (student.level || "")
                            .toLowerCase()
                            .includes(search)

                    );

                });


            displayStudents(filtered);

        }
    );


    // ========================================
    // START
    // ========================================

    await loadStudents();

});