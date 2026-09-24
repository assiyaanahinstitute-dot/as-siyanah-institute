document.addEventListener("DOMContentLoaded", async function () {

    const resultsTableBody =
        document.getElementById("resultsTableBody");

    const resultsMessage =
        document.getElementById("resultsMessage");

    const searchInput =
        document.getElementById("resultSearch");

    let results = [];


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
    // LOAD RESULTS
    // ========================================

    async function loadResults() {

        resultsMessage.textContent =
            "Loading results...";

        const { data, error } =
            await supabaseClient
                .from("Results")
                .select(`
                    student_id,
                    subject,
                    test_score,
                    exam_score,
                    total_score,
                    grade,
                    term,
                    session
                `)
                .order("student_id", {
                    ascending: true
                });

        if (error) {

            console.error(
                "Results loading error:",
                error
            );

            resultsMessage.textContent =
                "Unable to load results: " +
                error.message;

            return;
        }


        results = data || [];


        resultsMessage.textContent =
            results.length +
            " result(s) found.";


        displayResults(results);
    }


    // ========================================
    // DISPLAY RESULTS
    // ========================================

    function displayResults(list) {

        resultsTableBody.innerHTML = "";


        if (!list.length) {

            resultsTableBody.innerHTML = `
                <tr>
                    <td colspan="9">
                        No results found.
                    </td>
                </tr>
            `;

            return;
        }


        list.forEach(function (result) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${result.student_id || "N/A"}
                </td>

                <td>
                    ${result.subject || "N/A"}
                </td>

                <td>
                    ${result.test_score ?? "N/A"}
                </td>

                <td>
                    ${result.exam_score ?? "N/A"}
                </td>

                <td>
                    ${result.total_score ?? "N/A"}
                </td>

                <td>
                    ${result.grade || "N/A"}
                </td>

                <td>
                    ${result.term || "N/A"}
                </td>

                <td>
                    ${result.session || "N/A"}
                </td>

                <td>

                    <button
                        type="button"
                        class="result-view-button"
                        data-student-id="${result.student_id}"
                    >
                        View
                    </button>

                </td>

            `;


            resultsTableBody.appendChild(row);

        });

    }


    // ========================================
    // SEARCH RESULTS
    // ========================================

    searchInput.addEventListener(
        "input",
        function () {

            const search =
                searchInput.value
                    .toLowerCase()
                    .trim();


            const filtered =
                results.filter(function (result) {

                    return (

                        (result.student_id || "")
                            .toLowerCase()
                            .includes(search)

                        ||

                        (result.subject || "")
                            .toLowerCase()
                            .includes(search)

                        ||

                        (result.term || "")
                            .toLowerCase()
                            .includes(search)

                        ||

                        (result.session || "")
                            .toLowerCase()
                            .includes(search)

                        ||

                        (result.grade || "")
                            .toLowerCase()
                            .includes(search)

                    );

                });


            displayResults(filtered);

        }
    );


    // ========================================
    // VIEW RESULT
    // ========================================

    resultsTableBody.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".result-view-button"
                );


            if (!button) {
                return;
            }


            const studentId =
                button.dataset.studentId;


            window.location.href =
                "admin-result-view.html?student_id=" +
                encodeURIComponent(
                    studentId
                );

        }
    );


    // ========================================
    // START
    // ========================================

    await loadResults();

});