// ========================================
// AS-SIYĀNAH INSTITUTE
// STUDENT TESTS
// ========================================


// ========================================
// ELEMENTS
// ========================================

const testsContainer =
    document.getElementById("testsContainer");

const messageBox =
    document.getElementById("message");


// ========================================
// MESSAGE
// ========================================

function showMessage(message, type = "error") {

    messageBox.textContent = message;

    messageBox.style.display = "block";


    if (type === "success") {

        messageBox.style.background =
            "#e7f5ec";

        messageBox.style.color =
            "#176b3c";

    } else {

        messageBox.style.background =
            "#fae8e8";

        messageBox.style.color =
            "#a52d2d";
    }
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
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ========================================
// GET LOGGED-IN STUDENT
// ========================================

async function getStudent() {

    const {
        data: {
            user
        },
        error
    } =
        await supabaseClient.auth.getUser();


    if (error || !user) {

        window.location.href =
            "login.html";

        return null;
    }


    const {
        data: student,
        error: studentError
    } =
        await supabaseClient
            .from("Student")
            .select(`
                id,
                auth_id,
                full_name,
                level,
                programme
            `)
            .eq(
                "auth_id",
                user.id
            )
            .maybeSingle();


    if (
        studentError ||
        !student
    ) {

        console.error(
            "Student error:",
            studentError
        );

        showMessage(
            "Unable to load your student profile."
        );

        return null;
    }


    return student;
}


// ========================================
// LOAD TESTS
// ========================================

async function loadTests(student) {

    testsContainer.innerHTML = `
        <div class="loading">
            Loading available tests...
        </div>
    `;


    const {
        data: tests,
        error
    } =
        await supabaseClient
            .from("Tests")
            .select(`
                id,
                title,
                description,
                level,
                duration_minutes,
                published,
                subject_id,
                created_at,
                Subjects (
                    name
                )
            `)
            .eq(
                "published",
                true
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Tests error:",
            error
        );

        testsContainer.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ⚠️
                </div>

                <h4>
                    Unable to load tests
                </h4>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>
        `;

        return;
    }


    // ========================================
    // FILTER BY STUDENT LEVEL
    // ========================================

    const studentLevel =
        normalizeLevel(
            student.level
        );


    const availableTests =
        (tests || []).filter(
            test => {

                const testLevel =
                    normalizeLevel(
                        test.level
                    );

                return (
                    testLevel === studentLevel
                );
            }
        );


    // ========================================
    // EMPTY STATE
    // ========================================

    if (
        availableTests.length === 0
    ) {

        testsContainer.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🧪
                </div>

                <h4>
                    No tests available
                </h4>

                <p>
                    There are currently no published tests
                    available for your level.
                </p>

            </div>
        `;

        return;
    }


    // ========================================
    // RENDER
    // ========================================

    testsContainer.innerHTML =
        availableTests
            .map(
                test =>
                    createTestCard(test)
            )
            .join("");
}


// ========================================
// NORMALIZE LEVEL
// ========================================

function normalizeLevel(level) {

    if (!level) {
        return "";
    }


    const value =
        String(level)
            .trim()
            .toLowerCase();


    /*
        Student table may contain:

        elementary
        intermediate
        advanced

        while Tests may contain:

        Elementary
        Intermediate
        Advanced
    */

    if (
        value.includes("elementary")
    ) {
        return "elementary";
    }


    if (
        value.includes("intermediate")
    ) {
        return "intermediate";
    }


    if (
        value.includes("advanced")
    ) {
        return "advanced";
    }


    return value;
}


// ========================================
// CREATE TEST CARD
// ========================================

function createTestCard(test) {

    const subject =
        test.Subjects?.name ||
        "No subject";


    const description =
        test.description ||
        "No instructions provided.";


    const duration =
        test.duration_minutes
            ? `${test.duration_minutes} minutes`
            : "No time limit";


    return `
        <article class="test-card">

            <div class="test-top">

                <div>

                    <h4>
                        ${escapeHTML(
                            test.title
                        )}
                    </h4>

                </div>

            </div>


            <p class="test-description">
                ${escapeHTML(
                    description
                )}
            </p>


            <div class="test-info">

                <span>
                    📚
                    ${escapeHTML(
                        subject
                    )}
                </span>

                <span>
                    🎓
                    ${escapeHTML(
                        test.level
                    )}
                </span>

                <span>
                    ⏱️
                    ${escapeHTML(
                        duration
                    )}
                </span>

            </div>


            <a
                href="test-instructions.html?id=${encodeURIComponent(test.id)}"
                class="start-test-btn"
            >
                View Test →
            </a>

        </article>
    `;
}


// ========================================
// INITIALIZE
// ========================================

async function initialize() {

    const student =
        await getStudent();


    if (!student) {
        return;
    }


    await loadTests(student);
}


initialize();