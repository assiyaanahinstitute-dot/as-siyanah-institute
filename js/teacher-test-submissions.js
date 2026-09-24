// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER TEST SUBMISSIONS
// ========================================

const SUPABASE_URL =
    "https://ridyfpaqoyegdvqmkiyl.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_dH1z6RuBIqxN88pyG9YfVA_1niXEWIh";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ========================================
// ELEMENTS
// ========================================

const submissionsContainer =
    document.getElementById("submissionsContainer");

const message =
    document.getElementById("message");

const totalSubmissions =
    document.getElementById("totalSubmissions");

const submittedCount =
    document.getElementById("submittedCount");

const pendingCount =
    document.getElementById("pendingCount");


// ========================================
// MESSAGE
// ========================================

function showMessage(text, type = "error") {

    message.innerHTML = `
        <div class="message-${type}">
            ${text}
        </div>
    `;

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
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
// CHECK TEACHER
// ========================================

async function checkTeacher() {

    const {
        data: {
            user
        }
    } = await supabaseClient.auth.getUser();

    if (!user) {

        window.location.href =
            "teacher-login.html";

        return null;
    }


    const {
        data: teacher,
        error
    } = await supabaseClient
        .from("Teachers")
        .select("id, auth_id, full_name, email, role")
        .eq("auth_id", user.id)
        .eq("role", "teacher")
        .maybeSingle();


    if (error) {

        console.error(
            "Teacher check error:",
            error
        );

        showMessage(
            "Unable to verify teacher account."
        );

        return null;
    }


    if (!teacher) {

        showMessage(
            "You are not authorized to access this page."
        );

        return null;
    }


    return teacher;
}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "—";
    }

    const date =
        new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString(
        "en-NG",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


// ========================================
// FORMAT SCORE
// ========================================

function formatScore(score) {

    if (
        score === null ||
        score === undefined ||
        score === ""
    ) {
        return "Pending";
    }

    const number =
        Number(score);

    if (Number.isNaN(number)) {
        return "Pending";
    }

    return number % 1 === 0
        ? number
        : number.toFixed(1);
}


// ========================================
// LOAD SUBMISSIONS
// ========================================

async function loadSubmissions() {

    submissionsContainer.innerHTML = `
        <div class="loading-card">
            <div class="spinner"></div>
            <p>Loading submissions...</p>
        </div>
    `;


    const {
        data,
        error
    } = await supabaseClient
        .from("Test_Attempts")
        .select(`
            id,
            test_id,
            student_id,
            started_at,
            submitted_at,
            score,
            status,
            created_at,

            Tests (
                id,
                title,
                level,

                Subjects (
                    name
                )
            )
        `)
        .not("submitted_at", "is", null)
        .order(
            "submitted_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Load submissions error:",
            error
        );

        showMessage(
            "Unable to load test submissions: " +
            error.message
        );

        submissionsContainer.innerHTML = "";

        return;
    }


    const attempts =
        data || [];


    // ========================================
    // LOAD STUDENTS
    // ========================================

    const studentIds =
        [
            ...new Set(
                attempts
                    .map(
                        attempt =>
                            attempt.student_id
                    )
                    .filter(
                        id =>
                            id !== null &&
                            id !== undefined
                    )
            )
        ];


    let students = [];


    if (studentIds.length > 0) {

        const {
            data: studentData,
            error: studentError
        } = await supabaseClient
            .from("Student")
            .select(`
                id,
                full_name,
                student_id,
                email,
                level,
                programme
            `)
            .in("id", studentIds);


        if (studentError) {

            console.error(
                "Student loading error:",
                studentError
            );

        } else {

            students =
                studentData || [];
        }
    }


    // ========================================
    // MAP STUDENTS
    // ========================================

    const studentMap =
        new Map();

    students.forEach(
        student => {

            studentMap.set(
                String(student.id),
                student
            );

        }
    );


    // ========================================
    // STATS
    // ========================================

    const total =
        attempts.length;

    const pending =
        attempts.filter(
            attempt =>
                String(
                    attempt.status || ""
                ).toLowerCase()
                .includes("pending")
        ).length;

    const submitted =
        total - pending;


    totalSubmissions.textContent =
        total;

    submittedCount.textContent =
        submitted;

    pendingCount.textContent =
        pending;


    // ========================================
    // EMPTY
    // ========================================

    if (attempts.length === 0) {

        submissionsContainer.innerHTML = `
            <div class="empty-card">

                <div class="empty-icon">
                    📝
                </div>

                <h3>No submissions yet</h3>

                <p>
                    Student test submissions will appear here.
                </p>

            </div>
        `;

        return;
    }


    // ========================================
    // RENDER
    // ========================================

    submissionsContainer.innerHTML =
        attempts
            .map(
                attempt => {

                    const student =
                        studentMap.get(
                            String(
                                attempt.student_id
                            )
                        );


                    const test =
                        attempt.Tests;


                    const subject =
                        test?.Subjects?.name ||
                        "No subject";


                    const status =
                        String(
                            attempt.status ||
                            "Submitted"
                        );


                    const isPending =
                        status
                            .toLowerCase()
                            .includes("pending");


                    const score =
                        formatScore(
                            attempt.score
                        );


                    return `
                        <article class="submission-card">

                            <div class="submission-main">

                                <div class="student-name">
                                    ${
                                        escapeHtml(
                                            student?.full_name ||
                                            "Unknown Student"
                                        )
                                    }
                                </div>

                                <div class="test-name">
                                    ${
                                        escapeHtml(
                                            test?.title ||
                                            "Unknown Test"
                                        )
                                    }
                                </div>

                                <div class="submission-meta">

                                    <span class="meta-item">
                                        📚 ${
                                            escapeHtml(
                                                subject
                                            )
                                        }
                                    </span>

                                    <span class="meta-item">
                                        🎓 ${
                                            escapeHtml(
                                                test?.level ||
                                                student?.level ||
                                                "—"
                                            )
                                        }
                                    </span>

                                    <span class="meta-item">
                                        📅 ${
                                            formatDate(
                                                attempt.submitted_at
                                            )
                                        }
                                    </span>

                                    <span class="meta-item">
                                        ID: ${
                                            escapeHtml(
                                                student?.student_id ||
                                                attempt.student_id
                                            )
                                        }
                                    </span>

                                </div>

                            </div>


                            <div class="submission-right">

                                <div class="score">

                                    <span class="score-label">
                                        Score
                                    </span>

                                    <span class="score-value">
                                        ${
                                            escapeHtml(
                                                score
                                            )
                                        }
                                    </span>

                                </div>


                                <span class="status ${
                                    isPending
                                        ? "status-pending"
                                        : "status-submitted"
                                }">

                                    ${
                                        escapeHtml(
                                            status
                                        )
                                    }

                                </span>


                                <a
                                    class="review-button"
                                    href="teacher-test-review.html?id=${
                                        encodeURIComponent(
                                            attempt.id
                                        )
                                    }"
                                >
                                    Review
                                </a>

                            </div>

                        </article>
                    `;
                }
            )
            .join("");
}


// ========================================
// INITIALIZE
// ========================================

async function initialize() {

    const teacher =
        await checkTeacher();

    if (!teacher) {
        return;
    }


    await loadSubmissions();
}


initialize();