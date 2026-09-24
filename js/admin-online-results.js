// ========================================
// AS-SIYĀNAH INSTITUTE
// ADMIN ONLINE TEST & EXAM RESULTS
// ========================================


// ========================================
// VARIABLES
// ========================================

const onlineResultsBody =
    document.getElementById(
        "onlineResultsTableBody"
    );

const onlineSearch =
    document.getElementById(
        "onlineResultSearch"
    );

const onlineType =
    document.getElementById(
        "onlineResultType"
    );

const onlineStatus =
    document.getElementById(
        "onlineResultStatus"
    );

const onlineTotal =
    document.getElementById(
        "onlineTotal"
    );

const onlineReviewed =
    document.getElementById(
        "onlineReviewed"
    );

const onlineAwaiting =
    document.getElementById(
        "onlineAwaiting"
    );

const onlineExams =
    document.getElementById(
        "onlineExams"
    );


let onlineResults = [];


// ========================================
// LOAD RESULTS
// ========================================

async function loadOnlineResults() {

    try {

        const {
            data: attempts,
            error
        } = await supabaseClient
            .from("Test_Attempts")
            .select(`
                id,
                test_id,
                student_id,
                score,
                status,
                submitted_at,
                teacher_feedback
            `)
            .order(
                "submitted_at",
                {
                    ascending: false
                }
            );


        if (error) {
            throw error;
        }


        if (!attempts) {

            onlineResults = [];

            renderOnlineResults();

            return;
        }


        // ========================================
        // LOAD DATA
        // ========================================

        const results = [];


        for (const attempt of attempts) {

            // ------------------------------
            // TEST
            // ------------------------------

            const {
                data: test
            } = await supabaseClient
                .from("Tests")
                .select(`
                    id,
                    title,
                    assessment_type,
                    subject_id,
                    level
                `)
                .eq(
                    "id",
                    attempt.test_id
                )
                .maybeSingle();


            if (!test) {
                continue;
            }


            // ------------------------------
            // STUDENT
            // ------------------------------

            const {
                data: student
            } = await supabaseClient
                .from("Student")
                .select(`
                    id,
                    student_id,
                    full_name,
                    email
                `)
                .eq(
                    "id",
                    attempt.student_id
                )
                .maybeSingle();


            // ------------------------------
            // SUBJECT
            // ------------------------------

            let subjectName =
                "Unknown Subject";


            if (test.subject_id) {

                const {
                    data: subject
                } = await supabaseClient
                    .from("Subjects")
                    .select("name")
                    .eq(
                        "id",
                        test.subject_id
                    )
                    .maybeSingle();


                if (subject) {

                    subjectName =
                        subject.name;

                }
            }


            results.push({

                ...attempt,

                test,

                student,

                subjectName

            });

        }


        onlineResults = results;

        renderOnlineResults();

    } catch (error) {

        console.error(
            "Online results error:",
            error
        );


        onlineResultsBody.innerHTML = `

            <tr>

                <td colspan="9">

                    Failed to load online results.

                    ${escapeHTML(
                        error.message || ""
                    )}

                </td>

            </tr>

        `;
    }
}


// ========================================
// RENDER
// ========================================

function renderOnlineResults() {

    const search =
        onlineSearch
            .value
            .toLowerCase()
            .trim();


    const type =
        onlineType.value;


    const status =
        onlineStatus.value;


    const filtered =
        onlineResults.filter(
            item => {


                const studentName =
                    item.student?.full_name ||
                    "";


                const studentId =
                    item.student?.student_id ||
                    "";


                const assessment =
                    item.test?.title ||
                    "";


                const matchesSearch =

                    studentName
                        .toLowerCase()
                        .includes(search)

                    ||

                    studentId
                        .toLowerCase()
                        .includes(search)

                    ||

                    assessment
                        .toLowerCase()
                        .includes(search);


                const matchesType =

                    type === "all"

                    ||

                    item.test?.assessment_type ===
                    type;


                const matchesStatus =

                    status === "all"

                    ||

                    item.status === status;


                return (
                    matchesSearch &&
                    matchesType &&
                    matchesStatus
                );

            }
        );


    // ========================================
    // STATS
    // ========================================

    onlineTotal.textContent =
        onlineResults.length;


    onlineReviewed.textContent =
        onlineResults.filter(
            item =>
                item.status ===
                "Reviewed"
        ).length;


    onlineAwaiting.textContent =
        onlineResults.filter(
            item =>
                item.status !==
                "Reviewed"
        ).length;


    onlineExams.textContent =
        onlineResults.filter(
            item =>
                item.test?.assessment_type ===
                "Exam"
        ).length;


    // ========================================
    // EMPTY
    // ========================================

    if (filtered.length === 0) {

        onlineResultsBody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="online-empty"
                >

                    No online results found.

                </td>

            </tr>

        `;

        return;
    }


    // ========================================
    // TABLE
    // ========================================

    onlineResultsBody.innerHTML =
        filtered.map(
            item => {


                const studentName =
                    item.student?.full_name ||
                    "Unknown Student";


                const studentId =
                    item.student?.student_id ||
                    "—";


                const assessment =
                    item.test?.title ||
                    "Unknown Assessment";


                const assessmentType =
                    item.test?.assessment_type ||
                    "Test";


                const status =
                    item.status ||
                    "Submitted";


                const feedback =
                    item.teacher_feedback ||
                    "No feedback provided";


                const score =
                    item.score !== null &&
                    item.score !== undefined
                        ? item.score
                        : "—";


                const typeClass =
                    assessmentType === "Exam"
                        ? "online-exam"
                        : "online-test";


                const statusClass =
                    status === "Reviewed"
                        ? "online-reviewed"
                        : "online-awaiting";


                return `

                    <tr>

                        <td>

                            <strong>
                                ${escapeHTML(
                                    studentName
                                )}
                            </strong>

                        </td>


                        <td>

                            ${escapeHTML(
                                studentId
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                assessment
                            )}

                        </td>


                        <td>

                            <span
                                class="
                                    online-result-badge
                                    ${typeClass}
                                "
                            >
                                ${escapeHTML(
                                    assessmentType
                                )}
                            </span>

                        </td>


                        <td>

                            ${escapeHTML(
                                item.subjectName
                            )}

                        </td>


                        <td>

                            <strong>
                                ${escapeHTML(
                                    String(score)
                                )}
                            </strong>

                        </td>


                        <td>

                            <span
                                class="
                                    online-result-badge
                                    ${statusClass}
                                "
                            >

                                ${escapeHTML(
                                    status
                                )}

                            </span>

                        </td>


                        <td>

                            <div
                                class="online-feedback"
                            >

                                ${escapeHTML(
                                    feedback
                                )}

                            </div>

                        </td>


                        <td>

                            ${formatDate(
                                item.submitted_at
                            )}

                        </td>

                    </tr>

                `;

            }
        ).join("");
}


// ========================================
// SEARCH
// ========================================

onlineSearch.addEventListener(
    "input",
    renderOnlineResults
);


onlineType.addEventListener(
    "change",
    renderOnlineResults
);


onlineStatus.addEventListener(
    "change",
    renderOnlineResults
);


// ========================================
// DATE
// ========================================

function formatDate(date) {

    if (!date) {
        return "—";
    }


    return new Date(date)
        .toLocaleString(
            "en-NG",
            {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            }
        );
}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ========================================
// START
// ========================================

loadOnlineResults();