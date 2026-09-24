// ========================================
// AS-SIYĀNAH INSTITUTE
// ADMIN PORTAL - TESTS & EXAMS
// ========================================


// ========================================
// SUPABASE CONNECTION
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

const assessmentList =
    document.getElementById("assessmentList");

const totalAssessments =
    document.getElementById("totalAssessments");

const totalTests =
    document.getElementById("totalTests");

const totalExams =
    document.getElementById("totalExams");

const totalSubmissions =
    document.getElementById("totalSubmissions");

const searchInput =
    document.getElementById("searchInput");

const typeFilter =
    document.getElementById("typeFilter");

const statusFilter =
    document.getElementById("statusFilter");


// ========================================
// DATA
// ========================================

let assessments = [];


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
// LOAD ASSESSMENTS
// ========================================

async function loadAssessments() {

    assessmentList.innerHTML = `
        <div class="assessment-loading">
            Loading tests and exams...
        </div>
    `;


    // ------------------------------------
    // LOAD TESTS / EXAMS
    // ------------------------------------

    const {
        data: tests,
        error: testsError
    } = await supabaseClient
        .from("Tests")
        .select(`
            id,
            title,
            description,
            subject_id,
            level,
            duration_minutes,
            published,
            created_by,
            created_at,
            updated_at,
            assessment_type
        `)
        .order("created_at", {
            ascending: false
        });


    if (testsError) {

        console.error(
            "Tests error:",
            testsError
        );

        assessmentList.innerHTML = `
            <div class="assessment-error">
                Unable to load tests and exams.
                <br><br>
                ${testsError.message}
            </div>
        `;

        return;
    }


    assessments = tests || [];


    // ------------------------------------
    // LOAD SUBJECTS
    // ------------------------------------

    const {
        data: subjects,
        error: subjectsError
    } = await supabaseClient
        .from("Subjects")
        .select("id, name");


    if (subjectsError) {

        console.error(
            "Subjects error:",
            subjectsError
        );

    }


    const subjectMap = {};

    (subjects || []).forEach(subject => {

        subjectMap[subject.id] =
            subject.name;

    });


    // ------------------------------------
    // LOAD QUESTIONS
    // ------------------------------------

    const {
        data: questions,
        error: questionsError
    } = await supabaseClient
        .from("Test_Questions")
        .select("id, test_id");


    if (questionsError) {

        console.error(
            "Questions error:",
            questionsError
        );

    }


    const questionCounts = {};

    (questions || []).forEach(question => {

        const testId =
            question.test_id;

        if (!questionCounts[testId]) {

            questionCounts[testId] = 0;

        }

        questionCounts[testId]++;

    });


    // ------------------------------------
    // LOAD SUBMISSIONS
    // ------------------------------------

    const {
        data: attempts,
        error: attemptsError
    } = await supabaseClient
        .from("Test_Attempts")
        .select("id, test_id, submitted_at");


    if (attemptsError) {

        console.error(
            "Attempts error:",
            attemptsError
        );

    }


    const submissionCounts = {};

    (attempts || []).forEach(attempt => {

        if (!attempt.submitted_at) {
            return;
        }


        const testId =
            attempt.test_id;


        if (!submissionCounts[testId]) {

            submissionCounts[testId] = 0;

        }

        submissionCounts[testId]++;

    });


    // ------------------------------------
    // PREPARE DATA
    // ------------------------------------

    assessments =
        assessments.map(test => {

            return {

                ...test,

                subject_name:
                    subjectMap[test.subject_id] ||
                    "Unknown Subject",

                question_count:
                    questionCounts[test.id] || 0,

                submission_count:
                    submissionCounts[test.id] || 0

            };

        });


    // ------------------------------------
    // STATISTICS
    // ------------------------------------

    updateStatistics();


    // ------------------------------------
    // DISPLAY
    // ------------------------------------

    renderAssessments();

}


// ========================================
// UPDATE STATISTICS
// ========================================

function updateStatistics() {

    const total =
        assessments.length;


    const tests =
        assessments.filter(
            item =>
                item.assessment_type === "Test"
        ).length;


    const exams =
        assessments.filter(
            item =>
                item.assessment_type === "Exam"
        ).length;


    const submissions =
        assessments.reduce(
            (total, item) =>
                total + item.submission_count,
            0
        );


    totalAssessments.textContent =
        total;


    totalTests.textContent =
        tests;


    totalExams.textContent =
        exams;


    totalSubmissions.textContent =
        submissions;

}


// ========================================
// RENDER ASSESSMENTS
// ========================================

function renderAssessments() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const selectedType =
        typeFilter.value;


    const selectedStatus =
        statusFilter.value;


    const filtered =
        assessments.filter(test => {

            // Search

            const matchesSearch =
                !search ||
                test.title
                    .toLowerCase()
                    .includes(search) ||
                (test.description || "")
                    .toLowerCase()
                    .includes(search) ||
                (test.subject_name || "")
                    .toLowerCase()
                    .includes(search);


            // Type

            const matchesType =
                selectedType === "All" ||
                test.assessment_type ===
                    selectedType;


            // Status

            const matchesStatus =
                selectedStatus === "All" ||
                (
                    selectedStatus === "Published" &&
                    test.published === true
                ) ||
                (
                    selectedStatus === "Draft" &&
                    test.published === false
                );


            return (
                matchesSearch &&
                matchesType &&
                matchesStatus
            );

        });


    if (!filtered.length) {

        assessmentList.innerHTML = `
            <div class="assessment-empty">
                No tests or exams found.
            </div>
        `;

        return;
    }


    assessmentList.innerHTML =
        filtered.map(
            test => createAssessmentCard(test)
        ).join("");

}


// ========================================
// CREATE ASSESSMENT CARD
// ========================================

function createAssessmentCard(test) {

    const isExam =
        test.assessment_type === "Exam";


    const typeClass =
        isExam
            ? "exam"
            : "test";


    const typeLabel =
        isExam
            ? "EXAM"
            : "TEST";


    const statusBadge =
        test.published
            ? `
                <span class="published-badge">
                    Published
                </span>
            `
            : `
                <span class="draft-badge">
                    Draft
                </span>
            `;


    const createdDate =
        test.created_at
            ? new Date(
                test.created_at
              ).toLocaleDateString(
                "en-GB",
                {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                }
              )
            : "—";


    return `

        <article class="assessment-card">

            <div class="assessment-card-top">

                <div class="assessment-title-area">

                    <span class="
                        assessment-badge
                        ${typeClass}
                    ">
                        ${typeLabel}
                    </span>

                    <h3>
                        ${escapeHtml(test.title)}
                    </h3>

                    <p class="assessment-description">
                        ${escapeHtml(
                            test.description ||
                            "No description provided."
                        )}
                    </p>

                </div>


                <div>
                    ${statusBadge}
                </div>

            </div>


            <div class="assessment-info">

                <div class="assessment-info-item">

                    <span>
                        Subject
                    </span>

                    <strong>
                        ${escapeHtml(
                            test.subject_name
                        )}
                    </strong>

                </div>


                <div class="assessment-info-item">

                    <span>
                        Level
                    </span>

                    <strong>
                        ${escapeHtml(
                            test.level || "—"
                        )}
                    </strong>

                </div>


                <div class="assessment-info-item">

                    <span>
                        Duration
                    </span>

                    <strong>
                        ${
                            test.duration_minutes
                                ? `${test.duration_minutes} minutes`
                                : "—"
                        }
                    </strong>

                </div>


                <div class="assessment-info-item">

                    <span>
                        Questions
                    </span>

                    <strong>
                        ${test.question_count}
                    </strong>

                </div>


                <div class="assessment-info-item">

                    <span>
                        Submissions
                    </span>

                    <strong>
                        ${test.submission_count}
                    </strong>

                </div>

            </div>


            <div class="assessment-actions">

                <a
                    href="admin-test-details.html?id=${test.id}"
                    class="assessment-action"
                >
                    View Details
                </a>


                <a
                    href="admin-test-submissions.html?test_id=${test.id}"
                    class="assessment-action"
                >
                    View Submissions
                </a>


                <span
                    class="assessment-action"
                    style="cursor: default;"
                >
                    Created ${createdDate}
                </span>

            </div>

        </article>

    `;

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHtml(value) {

    if (value === null ||
        value === undefined) {

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
// SEARCH
// ========================================

searchInput.addEventListener(
    "input",
    renderAssessments
);


// ========================================
// TYPE FILTER
// ========================================

typeFilter.addEventListener(
    "change",
    renderAssessments
);


// ========================================
// STATUS FILTER
// ========================================

statusFilter.addEventListener(
    "change",
    renderAssessments
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


    await loadAssessments();

}


init();