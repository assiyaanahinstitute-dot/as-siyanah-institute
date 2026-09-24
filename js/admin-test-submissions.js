// ========================================
// AS-SIYĀNAH INSTITUTE
// ADMIN PORTAL
// TEST & EXAM SUBMISSIONS
// ========================================


// ========================================
// SUPABASE
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

const submissionList =
    document.getElementById("submissionList");

const totalSubmissions =
    document.getElementById("totalSubmissions");

const totalReviewed =
    document.getElementById("totalReviewed");

const totalPending =
    document.getElementById("totalPending");

const totalExamSubmissions =
    document.getElementById("totalExamSubmissions");

const searchInput =
    document.getElementById("searchInput");

const typeFilter =
    document.getElementById("typeFilter");

const statusFilter =
    document.getElementById("statusFilter");


// ========================================
// DATA
// ========================================

let submissions = [];


// ========================================
// CHECK ADMIN
// ========================================

async function checkAdmin() {

    const {
        data: {
            user
        },
        error
    } = await supabaseClient.auth.getUser();


    if (error || !user) {

        window.location.href =
            "admin-login.html";

        return false;
    }


    const {
        data: admin,
        error: adminError
    } = await supabaseClient
        .from("Admin")
        .select("id, auth_id, role")
        .eq("auth_id", user.id)
        .eq("role", "admin")
        .maybeSingle();


    if (adminError || !admin) {

        alert(
            "You do not have permission to access the Admin Portal."
        );

        window.location.href =
            "admin-login.html";

        return false;
    }


    return true;
}


// ========================================
// LOAD SUBMISSIONS
// ========================================

async function loadSubmissions() {

    submissionList.innerHTML = `
        <div class="submission-loading">
            Loading submissions...
        </div>
    `;


    // ------------------------------------
    // LOAD ATTEMPTS
    // ------------------------------------

    const {
        data: attempts,
        error: attemptsError
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
            teacher_feedback,
            created_at,

            Tests (
                id,
                title,
                level,
                assessment_type,
                subject_id
            )
        `)
        .not("submitted_at", "is", null)
        .order("submitted_at", {
            ascending: false
        });


    if (attemptsError) {

        console.error(
            "Attempts error:",
            attemptsError
        );

        submissionList.innerHTML = `
            <div class="submission-error">
                Unable to load submissions.
                <br><br>
                ${escapeHtml(
                    attemptsError.message
                )}
            </div>
        `;

        return;
    }


    // ------------------------------------
    // LOAD STUDENTS
    // ------------------------------------

    const {
        data: students,
        error: studentsError
    } = await supabaseClient
        .from("Student")
        .select(`
            id,
            student_id,
            full_name,
            email,
            programme,
            level
        `);


    if (studentsError) {

        console.error(
            "Students error:",
            studentsError
        );

    }


    // ------------------------------------
    // LOAD SUBJECTS
    // ------------------------------------

    const {
        data: subjects,
        error: subjectsError
    } = await supabaseClient
        .from("Subjects")
        .select(`
            id,
            name
        `);


    if (subjectsError) {

        console.error(
            "Subjects error:",
            subjectsError
        );

    }


    // ------------------------------------
    // MAP STUDENTS
    // ------------------------------------

    const studentMap = {};

    (students || []).forEach(student => {

        studentMap[student.id] =
            student;

    });


    // ------------------------------------
    // MAP SUBJECTS
    // ------------------------------------

    const subjectMap = {};

    (subjects || []).forEach(subject => {

        subjectMap[subject.id] =
            subject.name;

    });


    // ------------------------------------
    // PREPARE SUBMISSIONS
    // ------------------------------------

    submissions =
        (attempts || []).map(attempt => {

            const student =
                studentMap[attempt.student_id] ||
                null;


            const test =
                attempt.Tests ||
                null;


            return {

                ...attempt,

                student_name:
                    student?.full_name ||
                    "Unknown Student",

                student_code:
                    student?.student_id ||
                    "—",

                student_email:
                    student?.email ||
                    "—",

                assessment_title:
                    test?.title ||
                    "Unknown Assessment",

                assessment_type:
                    test?.assessment_type ||
                    "Test",

                subject_name:
                    subjectMap[test?.subject_id] ||
                    "Unknown Subject",

                assessment_level:
                    test?.level ||
                    "—"

            };

        });


    updateStatistics();

    renderSubmissions();

}


// ========================================
// STATISTICS
// ========================================

function updateStatistics() {

    const total =
        submissions.length;


    const reviewed =
        submissions.filter(
            item =>
                item.status === "Reviewed"
        ).length;


    const pending =
        submissions.filter(
            item =>
                item.status !== "Reviewed"
        ).length;


    const exams =
        submissions.filter(
            item =>
                item.assessment_type === "Exam"
        ).length;


    totalSubmissions.textContent =
        total;


    totalReviewed.textContent =
        reviewed;


    totalPending.textContent =
        pending;


    totalExamSubmissions.textContent =
        exams;

}


// ========================================
// RENDER
// ========================================

function renderSubmissions() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedType =
        typeFilter.value;


    const selectedStatus =
        statusFilter.value;


    const filtered =
        submissions.filter(item => {

            const searchableText = `

                ${item.student_name}

                ${item.student_code}

                ${item.assessment_title}

                ${item.subject_name}

            `.toLowerCase();


            const matchesSearch =
                !search ||
                searchableText.includes(search);


            const matchesType =
                selectedType === "All" ||
                item.assessment_type ===
                    selectedType;


            const matchesStatus =
                selectedStatus === "All" ||
                item.status ===
                    selectedStatus;


            return (
                matchesSearch &&
                matchesType &&
                matchesStatus
            );

        });


    if (!filtered.length) {

        submissionList.innerHTML = `
            <div class="submission-empty">
                No submissions found.
            </div>
        `;

        return;
    }


    submissionList.innerHTML =
        filtered
            .map(
                item =>
                    createSubmissionCard(item)
            )
            .join("");

}


// ========================================
// CREATE CARD
// ========================================

function createSubmissionCard(item) {

    const isReviewed =
        item.status === "Reviewed";


    const statusClass =
        isReviewed
            ? "status-reviewed"
            : "status-submitted";


    const statusText =
        isReviewed
            ? "Reviewed"
            : "Awaiting Review";


    const submissionDate =
        item.submitted_at
            ? new Date(
                item.submitted_at
              ).toLocaleDateString(
                "en-GB",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
              )
            : "—";


    const submissionTime =
        item.submitted_at
            ? new Date(
                item.submitted_at
              ).toLocaleTimeString(
                "en-GB",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
              )
            : "—";


    const score =
        item.score !== null &&
        item.score !== undefined
            ? item.score
            : "Not graded";


    const feedback =
        item.teacher_feedback;


    return `

        <article class="submission-card">

            <div class="submission-top">

                <div class="student-info">

                    <h3>
                        ${escapeHtml(
                            item.student_name
                        )}
                    </h3>

                    <p>
                        Student ID:
                        ${escapeHtml(
                            item.student_code
                        )}
                    </p>

                    <p>
                        ${escapeHtml(
                            item.student_email
                        )}
                    </p>

                    <div class="assessment-name">
                        ${escapeHtml(
                            item.assessment_title
                        )}
                    </div>

                </div>


                <div>

                    <span class="
                        status-badge
                        ${statusClass}
                    ">
                        ${statusText}
                    </span>

                </div>

            </div>


            <div class="submission-info">

                <div>

                    <span>
                        Type
                    </span>

                    <strong>
                        ${escapeHtml(
                            item.assessment_type
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Subject
                    </span>

                    <strong>
                        ${escapeHtml(
                            item.subject_name
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Level
                    </span>

                    <strong>
                        ${escapeHtml(
                            item.assessment_level
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Score
                    </span>

                    <strong>
                        ${escapeHtml(
                            String(score)
                        )}
                    </strong>

                </div>


                <div>

                    <span>
                        Submitted
                    </span>

                    <strong>
                        ${submissionDate}
                        ${submissionTime}
                    </strong>

                </div>

            </div>


            ${
                feedback
                    ? `
                        <div class="feedback-box">

                            <strong>
                                Teacher Feedback
                            </strong>

                            <p>
                                ${escapeHtml(
                                    feedback
                                )}
                            </p>

                        </div>
                    `
                    : ""
            }

        </article>

    `;

}


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
// FILTER EVENTS
// ========================================

searchInput.addEventListener(
    "input",
    renderSubmissions
);


typeFilter.addEventListener(
    "change",
    renderSubmissions
);


statusFilter.addEventListener(
    "change",
    renderSubmissions
);


// ========================================
// START
// ========================================

async function init() {

    const isAdmin =
        await checkAdmin();


    if (!isAdmin) {
        return;
    }


    await loadSubmissions();

}


init();