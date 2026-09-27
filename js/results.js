document.addEventListener("DOMContentLoaded", async function () {

    const studentName =
        document.getElementById("studentName");

    const studentId =
        document.getElementById("studentId");

    const studentProgramme =
        document.getElementById("studentProgramme");

    const studentLevel =
        document.getElementById("studentLevel");

    const resultsContainer =
        document.getElementById("resultsContainer");


    // ========================================
    // ESCAPE HTML
    // ========================================

    function escapeHtml(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    // ========================================
    // FORMAT DATE
    // ========================================

    function formatDate(value) {

        if (!value) {
            return "—";
        }

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "—";
        }

        return date.toLocaleString(
            "en-NG",
            {
                dateStyle: "medium",
                timeStyle: "short"
            }
        );
    }


    // ========================================
    // STATUS CLASS
    // ========================================

    function getStatusClass(status) {

        const normalized =
            String(status || "")
                .toLowerCase();

        if (normalized === "reviewed") {
            return "status-reviewed";
        }

        if (
            normalized === "pending review" ||
            normalized === "submitted"
        ) {
            return "status-pending";
        }

        return "status-default";
    }


    // ========================================
    // ASSESSMENT NAME
    // ========================================

    function getAssessmentName(test) {

        return test?.assessment_type === "Exam"
            ? "Exam"
            : "Test";
    }


    try {

        // ========================================
        // AUTHENTICATION
        // ========================================

        const {
            data: { user },
            error: authError
        } =
            await supabaseClient.auth.getUser();


        if (authError || !user) {

            window.location.href =
                "login.html";

            return;
        }


        // ========================================
        // GET STUDENT
        // FIRST: AUTH ID
        // FALLBACK: EMAIL
        // ========================================

        let student = null;


        const {
            data: authStudent,
            error: authStudentError
        } =
            await supabaseClient
                .from("Student")
                .select(`
                    id,
                    full_name,
                    student_id,
                    programme,
                    level,
                    email
                `)
                .eq("auth_id", user.id)
                .maybeSingle();


        if (authStudentError) {

            console.error(
                "Auth ID student lookup error:",
                authStudentError
            );

        } else {

            student = authStudent;

        }


        // ========================================
        // FALLBACK TO EMAIL
        // ========================================

        if (!student && user.email) {

            const {
                data: emailStudent,
                error: emailStudentError
            } =
                await supabaseClient
                    .from("Student")
                    .select(`
                        id,
                        full_name,
                        student_id,
                        programme,
                        level,
                        email
                    `)
                    .eq("email", user.email)
                    .maybeSingle();


            if (emailStudentError) {

                console.error(
                    "Email student lookup error:",
                    emailStudentError
                );

                throw emailStudentError;

            }


            student = emailStudent;

        }


        // ========================================
        // STUDENT NOT FOUND
        // ========================================

        if (!student) {

            if (studentName)
                studentName.textContent =
                    "Student not found";

            if (studentId)
                studentId.textContent =
                    "—";

            if (studentProgramme)
                studentProgramme.textContent =
                    "—";

            if (studentLevel)
                studentLevel.textContent =
                    "—";

            resultsContainer.innerHTML = `

                <div style="
                    text-align:center;
                    padding:45px 20px;
                ">

                    <h3>
                        Student record not found
                    </h3>

                    <p>
                        We could not find your student
                        information.
                    </p>

                </div>

            `;

            return;
        }


        // ========================================
        // DISPLAY STUDENT INFORMATION
        // ========================================

        if (studentName) {

            studentName.textContent =
                student.full_name || "—";

        }


        if (studentId) {

            studentId.textContent =
                student.student_id || "—";

        }


        if (studentProgramme) {

            studentProgramme.textContent =
                student.programme || "—";

        }


        if (studentLevel) {

            studentLevel.textContent =
                student.level || "—";

        }


        // ========================================
        // ACADEMIC RESULTS
        // ========================================

        const {
            data: results,
            error: resultsError
        } =
            await supabaseClient
                .from("Results")
                .select(`
                    subject,
                    test_score,
                    exam_score,
                    total_score,
                    grade,
                    term,
                    session
                `)
                .eq(
                    "student_id",
                    student.student_id
                )
                .order(
                    "subject",
                    {
                        ascending: true
                    }
                );


        if (resultsError) {

            console.error(
                "Results error:",
                resultsError
            );

        }


        // ========================================
        // ONLINE TEST / EXAM RESULTS
        // ========================================

        const {
            data: testAttempts,
            error: testAttemptsError
        } =
            await supabaseClient
                .from("Test_Attempts")
                .select(`
                    id,
                    test_id,
                    student_id,
                    submitted_at,
                    score,
                    status,
                    teacher_feedback,

                    Tests (
                        id,
                        title,
                        level,
                        assessment_type,

                        Subjects (
                            name
                        )
                    )
                `)
                .eq(
                    "student_id",
                    student.id
                )
                .not(
                    "submitted_at",
                    "is",
                    null
                )
                .order(
                    "submitted_at",
                    {
                        ascending: false
                    }
                );


        if (testAttemptsError) {

            console.error(
                "Online test/exam results error:",
                testAttemptsError
            );

        }


        const academicResults =
            results || [];

        const onlineResults =
            testAttempts || [];


        const hasAcademicResults =
            academicResults.length > 0;

        const hasOnlineResults =
            onlineResults.length > 0;


        // ========================================
        // NO RESULTS
        // ========================================

        if (
            !hasAcademicResults &&
            !hasOnlineResults
        ) {

            resultsContainer.innerHTML = `

                <div style="
                    text-align:center;
                    padding:50px 20px;
                ">

                    <div style="
                        font-size:45px;
                        margin-bottom:15px;
                    ">
                        📊
                    </div>

                    <h3>
                        No Results Available Yet
                    </h3>

                    <p>
                        Your results will appear here
                        when they are published by your teacher.
                    </p>

                </div>

            `;

            return;
        }


        let html = "";


        // ========================================
        // ACADEMIC RESULTS
        // ========================================

        if (hasAcademicResults) {

            const total =
                academicResults.reduce(
                    function (sum, result) {

                        return sum +
                            Number(
                                result.total_score || 0
                            );

                    },
                    0
                );


            const average =
                total /
                academicResults.length;


            let overallGrade = "F";


            if (average >= 80) {
                overallGrade = "A";
            }

            else if (average >= 70) {
                overallGrade = "B";
            }

            else if (average >= 60) {
                overallGrade = "C";
            }

            else if (average >= 50) {
                overallGrade = "D";
            }

            else if (average >= 40) {
                overallGrade = "E";
            }


            html += `

                <section
                    class="academic-results-section"
                >

                    <div class="section-heading">

                        <h2>
                            Academic Results
                        </h2>

                        <p>
                            Your published academic results
                        </p>

                    </div>


                    <div class="results-summary">

                        <div class="result-summary-card">

                            <span>
                                Subjects
                            </span>

                            <strong>
                                ${academicResults.length}
                            </strong>

                        </div>


                        <div class="result-summary-card">

                            <span>
                                Average
                            </span>

                            <strong>
                                ${average.toFixed(1)}%
                            </strong>

                        </div>


                        <div class="result-summary-card">

                            <span>
                                Overall Grade
                            </span>

                            <strong>
                                ${overallGrade}
                            </strong>

                        </div>

                    </div>


                    <div class="results-table-wrapper">

                        <table class="results-table">

                            <thead>

                                <tr>

                                    <th>Subject</th>
                                    <th>Test</th>
                                    <th>Exam</th>
                                    <th>Total</th>
                                    <th>Grade</th>
                                    <th>Term</th>
                                    <th>Session</th>

                                </tr>

                            </thead>

                            <tbody>

            `;


            academicResults.forEach(
                function (result) {

                    html += `

                        <tr>

                            <td>
                                ${escapeHtml(
                                    result.subject || "—"
                                )}
                            </td>

                            <td>
                                ${result.test_score ?? 0}
                            </td>

                            <td>
                                ${result.exam_score ?? 0}
                            </td>

                            <td>
                                <strong>
                                    ${result.total_score ?? 0}
                                </strong>
                            </td>

                            <td>
                                <strong>
                                    ${escapeHtml(
                                        result.grade || "—"
                                    )}
                                </strong>
                            </td>

                            <td>
                                ${escapeHtml(
                                    result.term || "—"
                                )}
                            </td>

                            <td>
                                ${escapeHtml(
                                    result.session || "—"
                                )}
                            </td>

                        </tr>

                    `;

                }
            );


            html += `

                            </tbody>

                        </table>

                    </div>

                </section>

            `;

        }


        // ========================================
        // ONLINE TESTS & EXAMS
        // ========================================

        if (hasOnlineResults) {

            html += `

                <section
                    class="online-test-results-section"
                    style="margin-top:40px;"
                >

                    <div class="section-heading">

                        <h2>
                            Tests & Exams
                        </h2>

                        <p>
                            Your completed online assessments
                        </p>

                    </div>


                    <div class="online-test-results">

            `;


            onlineResults.forEach(
                function (attempt) {

                    const test =
                        attempt.Tests;


                    const assessmentName =
                        getAssessmentName(test);


                    const subject =
                        test?.Subjects?.name ||
                        "No subject";


                    const status =
                        attempt.status ||
                        "Submitted";


                    const statusClass =
                        getStatusClass(status);


                    const score =
                        attempt.score !== null &&
                        attempt.score !== undefined
                            ? attempt.score
                            : "Pending";


                    const feedback =
                        attempt.teacher_feedback;


                    html += `

                        <article
                            class="online-test-result-card"
                            style="
                                margin-bottom:20px;
                                padding:24px;
                                border-radius:16px;
                                background:#ffffff;
                                border:1px solid #e5e7eb;
                                box-shadow:
                                    0 8px 25px
                                    rgba(0,0,0,0.05);
                            "
                        >

                            <div
                                style="
                                    display:flex;
                                    justify-content:space-between;
                                    align-items:flex-start;
                                    gap:20px;
                                    flex-wrap:wrap;
                                "
                            >

                                <div>

                                    <span
                                        style="
                                            display:inline-block;
                                            margin-bottom:8px;
                                            padding:5px 10px;
                                            border-radius:20px;
                                            background:#eef5f1;
                                            color:#1d5e3c;
                                            font-size:12px;
                                            font-weight:700;
                                        "
                                    >
                                        ${assessmentName}
                                    </span>

                                    <h3
                                        style="
                                            margin:0 0 8px;
                                        "
                                    >
                                        ${escapeHtml(
                                            test?.title ||
                                            assessmentName
                                        )}
                                    </h3>

                                    <p
                                        style="
                                            margin:0;
                                            color:#64748b;
                                        "
                                    >
                                        ${escapeHtml(
                                            subject
                                        )}
                                        •
                                        ${escapeHtml(
                                            test?.level ||
                                            "—"
                                        )}
                                    </p>

                                </div>


                                <div
                                    style="
                                        text-align:right;
                                    "
                                >

                                    <div
                                        style="
                                            font-size:28px;
                                            font-weight:700;
                                            color:#1d5e3c;
                                        "
                                    >
                                        ${escapeHtml(
                                            String(score)
                                        )}
                                    </div>

                                    <span
                                        class="${statusClass}"
                                    >
                                        ${escapeHtml(
                                            status
                                        )}
                                    </span>

                                </div>

                            </div>


                            <div
                                style="
                                    display:grid;
                                    grid-template-columns:
                                        repeat(
                                            auto-fit,
                                            minmax(180px,1fr)
                                        );
                                    gap:15px;
                                    margin-top:20px;
                                "
                            >

                                <div
                                    style="
                                        padding:15px;
                                        border-radius:12px;
                                        background:#f8fafc;
                                    "
                                >

                                    <strong>
                                        Score
                                    </strong>

                                    <p
                                        style="
                                            margin:6px 0 0;
                                            color:#64748b;
                                        "
                                    >
                                        ${
                                            score === "Pending"
                                                ? "Awaiting review"
                                                : `${score} mark${
                                                    Number(score) === 1
                                                        ? ""
                                                        : "s"
                                                  }`
                                        }
                                    </p>

                                </div>


                                <div
                                    style="
                                        padding:15px;
                                        border-radius:12px;
                                        background:#f8fafc;
                                    "
                                >

                                    <strong>
                                        Submitted
                                    </strong>

                                    <p
                                        style="
                                            margin:6px 0 0;
                                            color:#64748b;
                                        "
                                    >
                                        ${formatDate(
                                            attempt.submitted_at
                                        )}
                                    </p>

                                </div>


                                <div
                                    style="
                                        padding:15px;
                                        border-radius:12px;
                                        background:#f8fafc;
                                    "
                                >

                                    <strong>
                                        Status
                                    </strong>

                                    <p
                                        style="
                                            margin:6px 0 0;
                                            color:#64748b;
                                        "
                                    >
                                        ${escapeHtml(
                                            status
                                        )}
                                    </p>

                                </div>

                            </div>


                            ${
                                feedback
                                    ? `

                                        <div
                                            style="
                                                margin-top:20px;
                                                padding:20px;
                                                border-radius:14px;
                                                background:#f0fdf4;
                                                border-left:
                                                    4px solid #16a34a;
                                            "
                                        >

                                            <div
                                                style="
                                                    display:flex;
                                                    align-items:center;
                                                    gap:8px;
                                                    margin-bottom:8px;
                                                "
                                            >

                                                <span>
                                                    💬
                                                </span>

                                                <strong>
                                                    Teacher Feedback
                                                </strong>

                                            </div>

                                            <p
                                                style="
                                                    margin:0;
                                                    line-height:1.8;
                                                    white-space:pre-wrap;
                                                    color:#334155;
                                                "
                                            >
                                                ${escapeHtml(
                                                    feedback
                                                )}
                                            </p>

                                        </div>

                                    `
                                    : (

                                        String(status)
                                            .toLowerCase() ===
                                            "reviewed"

                                            ? `

                                                <div
                                                    style="
                                                        margin-top:20px;
                                                        padding:16px;
                                                        border-radius:12px;
                                                        background:#eef5f1;
                                                        color:#1d5e3c;
                                                    "
                                                >

                                                    Your
                                                    ${assessmentName.toLowerCase()}
                                                    has been reviewed.
                                                    No teacher feedback
                                                    was provided.

                                                </div>

                                            `

                                            : `

                                                <div
                                                    style="
                                                        margin-top:20px;
                                                        padding:16px;
                                                        border-radius:12px;
                                                        background:#fff7ed;
                                                        color:#9a3412;
                                                    "
                                                >

                                                    Your
                                                    ${assessmentName.toLowerCase()}
                                                    is awaiting
                                                    teacher review.

                                                </div>

                                            `
                                    )
                            }

                        </article>

                    `;

                }
            );


            html += `

                    </div>

                </section>

            `;

        }


        // ========================================
        // DISPLAY
        // ========================================

        resultsContainer.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Results page error:",
            error
        );


        resultsContainer.innerHTML = `

            <div
                style="
                    text-align:center;
                    padding:40px;
                "
            >

                <h3>
                    Something went wrong
                </h3>

                <p>
                    ${escapeHtml(
                        error.message
                    )}
                </p>

            </div>

        `;

    }

});