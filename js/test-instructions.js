// ========================================
// AS-SIYĀNAH INSTITUTE
// STUDENT TEST INSTRUCTIONS
// ========================================


// ========================================
// ELEMENTS
// ========================================

const loading =
    document.getElementById("loading");

const testContent =
    document.getElementById("testContent");

const messageBox =
    document.getElementById("message");

const testTitle =
    document.getElementById("testTitle");

const testDescription =
    document.getElementById("testDescription");

const testSubject =
    document.getElementById("testSubject");

const testLevel =
    document.getElementById("testLevel");

const testDuration =
    document.getElementById("testDuration");

const instructions =
    document.getElementById("instructions");

const startTestButton =
    document.getElementById("startTestButton");


// ========================================
// GET TEST ID
// ========================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const testId =
    urlParams.get("id");


// ========================================
// MESSAGE
// ========================================

function showMessage(
    message,
    type = "error"
) {

    messageBox.textContent =
        message;

    messageBox.style.display =
        "block";

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
// CHECK LOGIN
// ========================================

async function getCurrentUser() {

    const {
        data: {
            user
        },
        error
    } =
        await supabaseClient.auth.getUser();

    if (
        error ||
        !user
    ) {

        window.location.href =
            "login.html";

        return null;
    }

    return user;
}


// ========================================
// LOAD TEST
// ========================================

async function loadTest() {

    if (!testId) {

        loading.style.display =
            "none";

        showMessage(
            "No test was selected."
        );

        return;
    }


    const {
        data: test,
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
                Subjects (
                    name
                )
            `)
            .eq(
                "id",
                testId
            )
            .eq(
                "published",
                true
            )
            .maybeSingle();


    if (error) {

        console.error(
            "Test loading error:",
            error
        );

        loading.style.display =
            "none";

        showMessage(
            error.message
        );

        return;
    }


    if (!test) {

        loading.style.display =
            "none";

        showMessage(
            "This test does not exist or is not currently available."
        );

        return;
    }


    // ====================================
    // DISPLAY TEST
    // ====================================

    testTitle.textContent =
        test.title || "Untitled Test";


    testDescription.textContent =
        test.description ||
        "Please read the instructions carefully before starting this test.";


    testSubject.textContent =
        test.Subjects?.name ||
        "No subject";


    testLevel.textContent =
        test.level ||
        "Not specified";


    testDuration.textContent =
        test.duration_minutes
            ? `${test.duration_minutes} minutes`
            : "No time limit";


    instructions.textContent =
        test.description ||
        "No additional instructions have been provided for this test.";


    // ====================================
    // SHOW CONTENT
    // ====================================

    loading.style.display =
        "none";

    testContent.style.display =
        "block";


    // ====================================
    // START BUTTON
    // ====================================

    startTestButton.onclick =
        function () {

            window.location.href =
                "take-test.html?id=" +
                encodeURIComponent(test.id);

        };
}


// ========================================
// INITIALIZE
// ========================================

async function initialize() {

    const user =
        await getCurrentUser();

    if (!user) {
        return;
    }

    await loadTest();
}


initialize();