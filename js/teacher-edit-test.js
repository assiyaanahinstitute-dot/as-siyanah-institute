// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER EDIT TEST
// ========================================


// ========================================
// ELEMENTS
// ========================================

const form =
    document.getElementById("editTestForm");

const titleInput =
    document.getElementById("title");

const descriptionInput =
    document.getElementById("description");

const subjectInput =
    document.getElementById("subject");

const levelInput =
    document.getElementById("level");

const durationInput =
    document.getElementById("duration");

const publishedInput =
    document.getElementById("published");

const saveBtn =
    document.getElementById("saveBtn");

const messageBox =
    document.getElementById("message");


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
// CHECK TEACHER
// ========================================

async function checkTeacher() {

    const {
        data: {
            user
        },
        error
    } =
        await supabaseClient.auth.getUser();


    if (error || !user) {

        window.location.href =
            "teacher-login.html";

        return null;
    }


    const {
        data: teacher,
        error: teacherError
    } =
        await supabaseClient
            .from("Teachers")
            .select(
                "id, auth_id, full_name, email, role"
            )
            .eq(
                "auth_id",
                user.id
            )
            .eq(
                "role",
                "teacher"
            )
            .maybeSingle();


    if (
        teacherError ||
        !teacher
    ) {

        alert(
            "Teacher access required."
        );

        await supabaseClient.auth.signOut();

        window.location.href =
            "teacher-login.html";

        return null;
    }


    return teacher;
}


// ========================================
// CHECK TEST ID
// ========================================

if (!testId) {

    showMessage(
        "No test ID was provided."
    );

    saveBtn.disabled = true;
}


// ========================================
// LOAD SUBJECTS
// ========================================

async function loadSubjects() {

    const {
        data: subjects,
        error
    } =
        await supabaseClient
            .from("Subjects")
            .select(
                "id, name"
            )
            .eq(
                "active",
                true
            )
            .order(
                "name",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Subjects error:",
            error
        );

        showMessage(
            "Unable to load subjects."
        );

        return;
    }


    subjectInput.innerHTML = `
        <option value="">
            Select subject
        </option>
    `;


    subjects.forEach(
        subject => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                subject.id;

            option.textContent =
                subject.name;

            subjectInput.appendChild(
                option
            );
        }
    );
}


// ========================================
// LOAD TEST
// ========================================

async function loadTest() {

    if (!testId) {
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
                subject_id,
                level,
                duration_minutes,
                published
            `)
            .eq(
                "id",
                testId
            )
            .single();


    if (error) {

        console.error(
            "Load test error:",
            error
        );

        showMessage(
            "Unable to load this test: " +
            error.message
        );

        saveBtn.disabled = true;

        return;
    }


    // ========================================
    // FILL FORM
    // ========================================

    titleInput.value =
        test.title || "";

    descriptionInput.value =
        test.description || "";

    subjectInput.value =
        test.subject_id || "";

    levelInput.value =
        test.level || "";

    durationInput.value =
        test.duration_minutes || "";

    publishedInput.checked =
        test.published === true;
}


// ========================================
// SAVE CHANGES
// ========================================

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!testId) {

            showMessage(
                "Test ID is missing."
            );

            return;
        }


        const title =
            titleInput.value.trim();

        const description =
            descriptionInput.value.trim();

        const subjectId =
            subjectInput.value;

        const level =
            levelInput.value;

        const duration =
            Number(
                durationInput.value
            );

        const published =
            publishedInput.checked;


        // ========================================
        // VALIDATION
        // ========================================

        if (!title) {

            showMessage(
                "Please enter a test title."
            );

            return;
        }


        if (!subjectId) {

            showMessage(
                "Please select a subject."
            );

            return;
        }


        if (!level) {

            showMessage(
                "Please select a student level."
            );

            return;
        }


        if (
            !duration ||
            duration < 1
        ) {

            showMessage(
                "Please enter a valid duration."
            );

            return;
        }


        // ========================================
        // BUTTON STATE
        // ========================================

        saveBtn.disabled = true;

        saveBtn.textContent =
            "Saving...";


        // ========================================
        // UPDATE TEST
        // ========================================

        const {
            error
        } =
            await supabaseClient
                .from("Tests")
                .update({
                    title: title,
                    description:
                        description || null,
                    subject_id:
                        Number(subjectId),
                    level: level,
                    duration_minutes:
                        duration,
                    published: published,
                    updated_at:
                        new Date().toISOString()
                })
                .eq(
                    "id",
                    testId
                );


        if (error) {

            console.error(
                "Update test error:",
                error
            );

            showMessage(
                error.message
            );

            saveBtn.disabled = false;

            saveBtn.textContent =
                "Save Changes";

            return;
        }


        // ========================================
        // SUCCESS
        // ========================================

        showMessage(
            "Test updated successfully.",
            "success"
        );


        saveBtn.textContent =
            "Saved ✓";


        // Return to test management
        setTimeout(
            function () {

                window.location.href =
                    "teacher-tests.html";

            },
            1000
        );

    }
);


// ========================================
// INITIALIZE
// ========================================

async function initialize() {

    const teacher =
        await checkTeacher();


    if (!teacher) {
        return;
    }


    await loadSubjects();

    await loadTest();
}


initialize();