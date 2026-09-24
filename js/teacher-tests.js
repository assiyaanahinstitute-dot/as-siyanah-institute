// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER TEST MANAGEMENT
// ========================================


// ========================================
// ELEMENTS
// ========================================

const testsContainer =
    document.getElementById("testsContainer");

const totalTests =
    document.getElementById("totalTests");

const publishedTests =
    document.getElementById("publishedTests");

const draftTests =
    document.getElementById("draftTests");

const messageBox =
    document.getElementById("message");


// ========================================
// MESSAGE
// ========================================

function showMessage(message, type = "error") {

    messageBox.textContent = message;

    messageBox.style.display = "block";

    if (type === "success") {

        messageBox.style.background = "#e7f5ec";
        messageBox.style.color = "#176b3c";

    } else {

        messageBox.style.background = "#fae8e8";
        messageBox.style.color = "#a52d2d";
    }
}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

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
        },
        error
    } = await supabaseClient.auth.getUser();


    if (error || !user) {

        window.location.href =
            "teacher-login.html";

        return null;
    }


    const {
        data: teacher,
        error: teacherError
    } = await supabaseClient
        .from("Teachers")
        .select("id, auth_id, full_name, email, role")
        .eq("auth_id", user.id)
        .eq("role", "teacher")
        .maybeSingle();


    if (teacherError || !teacher) {

        alert("Teacher access required.");

        await supabaseClient.auth.signOut();

        window.location.href =
            "teacher-login.html";

        return null;
    }


    return teacher;
}


// ========================================
// LOAD TESTS
// ========================================

async function loadTests() {

    testsContainer.innerHTML = `
        <div class="loading">
            Loading tests...
        </div>
    `;


    const {
        data: tests,
        error
    } = await supabaseClient
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
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Load tests error:",
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
    // UPDATE STATS
    // ========================================

    const allTests =
        tests || [];

    const published =
        allTests.filter(
            test => test.published === true
        ).length;

    const drafts =
        allTests.filter(
            test => test.published !== true
        ).length;


    totalTests.textContent =
        allTests.length;

    publishedTests.textContent =
        published;

    draftTests.textContent =
        drafts;


    // ========================================
    // EMPTY STATE
    // ========================================

    if (allTests.length === 0) {

        testsContainer.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    🧪
                </div>

                <h4>
                    No tests yet
                </h4>

                <p>
                    Create your first test for your students.
                </p>

                <a
                    href="teacher-create-test.html"
                    class="create-btn"
                >
                    + Create Your First Test
                </a>

            </div>
        `;

        return;
    }


    // ========================================
    // RENDER TESTS
    // ========================================

    testsContainer.innerHTML =
        allTests.map(
            test => createTestCard(test)
        ).join("");


    // ========================================
    // DELETE BUTTONS
    // ========================================

    document
        .querySelectorAll(".delete-test")
        .forEach(button => {

            button.addEventListener(
                "click",
                async function () {

                    const testId =
                        this.dataset.id;

                    await deleteTest(testId);
                }
            );

        });
}


// ========================================
// CREATE TEST CARD
// ========================================

function createTestCard(test) {

    const subject =
        test.Subjects?.name ||
        "No subject";


    const statusClass =
        test.published
            ? "published"
            : "draft";


    const statusText =
        test.published
            ? "Published"
            : "Draft";


    const description =
        test.description ||
        "No instructions provided.";


    const duration =
        test.duration_minutes
            ? `${test.duration_minutes} minutes`
            : "No time limit";


    const createdDate =
        test.created_at
            ? new Date(
                test.created_at
            ).toLocaleDateString()
            : "—";


    return `
        <article class="test-card">

            <div class="test-top">

                <div>

                    <h4>
                        ${escapeHTML(test.title)}
                    </h4>

                </div>

                <span class="status ${statusClass}">
                    ${statusText}
                </span>

            </div>


            <p class="test-description">
                ${escapeHTML(description)}
            </p>


            <div class="test-info">

                <span>
                    📚 ${escapeHTML(subject)}
                </span>

                <span>
                    🎓 ${escapeHTML(test.level || "All Levels")}
                </span>

                <span>
                    ⏱️ ${escapeHTML(duration)}
                </span>

                <span>
                    📅 ${escapeHTML(createdDate)}
                </span>

            </div>


            <div class="test-actions">

                <a
                    href="teacher-test-questions.html?id=${encodeURIComponent(test.id)}"
                    class="btn-questions"
                >
                    ❓ Questions
                </a>


                <a
                    href="teacher-edit-test.html?id=${encodeURIComponent(test.id)}"
                    class="btn-edit"
                >
                    ✏️ Edit
                </a>


                <button
                    type="button"
                    class="btn-delete delete-test"
                    data-id="${escapeHTML(test.id)}"
                >
                    🗑️ Delete
                </button>

            </div>

        </article>
    `;
}


// ========================================
// DELETE TEST
// ========================================

async function deleteTest(testId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this test?\n\nAll questions and attempts connected to this test will also be deleted."
        );


    if (!confirmed) {
        return;
    }


    try {

        const {
            error
        } = await supabaseClient
            .from("Tests")
            .delete()
            .eq("id", testId);


        if (error) {

            console.error(
                "Delete test error:",
                error
            );

            showMessage(
                error.message
            );

            return;
        }


        showMessage(
            "Test deleted successfully.",
            "success"
        );


        await loadTests();

    } catch (error) {

        console.error(error);

        showMessage(
            "Something went wrong while deleting the test."
        );
    }
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


    await loadTests();
}


initialize();