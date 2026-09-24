// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER CREATE TEST / EXAM
// ========================================


// ========================================
// ELEMENTS
// ========================================

const form =
    document.getElementById("createTestForm");

const assessmentTypeSelect =
    document.getElementById("assessmentType");

const titleInput =
    document.getElementById("title");

const descriptionInput =
    document.getElementById("description");

const subjectSelect =
    document.getElementById("subject");

const levelSelect =
    document.getElementById("level");

const durationInput =
    document.getElementById("duration");

const publishedInput =
    document.getElementById("published");

const createBtn =
    document.getElementById("createBtn");

const messageBox =
    document.getElementById("message");


// ========================================
// SHOW MESSAGE
// ========================================

function showMessage(message, type) {

    messageBox.innerHTML = `
        <div class="${type}-message">
            ${message}
        </div>
    `;
}


// ========================================
// AUTHENTICATION
// ========================================

async function initializePage() {

    const {
        data: { user },
        error: authError
    } = await supabaseClient.auth.getUser();


    if (authError || !user) {

        window.location.href =
            "teacher-login.html";

        return;
    }


    // ========================================
    // VERIFY TEACHER
    // ========================================

    const {
        data: teacher,
        error: teacherError
    } = await supabaseClient
        .from("Teachers")
        .select("id, auth_id, role")
        .eq("auth_id", user.id)
        .eq("role", "teacher")
        .maybeSingle();


    if (teacherError) {

        console.error(
            "Teacher verification error:",
            teacherError
        );

        showMessage(
            "Unable to verify teacher account.",
            "error"
        );

        createBtn.disabled = true;

        return;
    }


    if (!teacher) {

        showMessage(
            "You are not authorized to create tests.",
            "error"
        );

        createBtn.disabled = true;

        return;
    }


    // ========================================
    // LOAD SUBJECTS
    // ========================================

    await loadSubjects();
}


// ========================================
// LOAD SUBJECTS
// ========================================

async function loadSubjects() {

    const {
        data: subjects,
        error
    } = await supabaseClient
        .from("Subjects")
        .select("id, name")
        .eq("active", true)
        .order("name", {
            ascending: true
        });


    if (error) {

        console.error(
            "Subject loading error:",
            error
        );

        showMessage(
            "Unable to load subjects.",
            "error"
        );

        return;
    }


    subjectSelect.innerHTML = `
        <option value="">
            Select subject
        </option>
    `;


    (subjects || []).forEach(subject => {

        const option =
            document.createElement("option");

        option.value =
            subject.id;

        option.textContent =
            subject.name;

        subjectSelect.appendChild(option);

    });
}


// ========================================
// CREATE TEST / EXAM
// ========================================

form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        // ========================================
        // GET FORM VALUES
        // ========================================

        const assessmentType =
            assessmentTypeSelect.value;

        const title =
            titleInput.value.trim();

        const description =
            descriptionInput.value.trim();

        const subjectId =
            subjectSelect.value;

        const level =
            levelSelect.value;

        const duration =
            Number(durationInput.value);

        const published =
            publishedInput.checked;


        // ========================================
        // VALIDATION
        // ========================================

        if (
            assessmentType !== "Test" &&
            assessmentType !== "Exam"
        ) {

            showMessage(
                "Please select Test or Exam.",
                "error"
            );

            return;
        }


        if (!title) {

            showMessage(
                "Please enter a test title.",
                "error"
            );

            return;
        }


        if (!subjectId) {

            showMessage(
                "Please select a subject.",
                "error"
            );

            return;
        }


        if (!level) {

            showMessage(
                "Please select a student level.",
                "error"
            );

            return;
        }


        if (!duration || duration < 1) {

            showMessage(
                "Please enter a valid duration.",
                "error"
            );

            return;
        }


        // ========================================
        // DISABLE BUTTON
        // ========================================

        createBtn.disabled = true;

        createBtn.textContent =
            assessmentType === "Exam"
                ? "Creating Exam..."
                : "Creating Test...";


        // ========================================
        // GET CURRENT USER
        // ========================================

        const {
            data: { user },
            error: userError
        } = await supabaseClient.auth.getUser();


        if (userError || !user) {

            showMessage(
                "Your session has expired. Please log in again.",
                "error"
            );

            createBtn.disabled = false;

            createBtn.textContent =
                "Create Test";

            return;
        }


        // ========================================
        // INSERT TEST / EXAM
        // ========================================

        const {
            data: test,
            error
        } = await supabaseClient
            .from("Tests")
            .insert([{

                title:
                    title,

                description:
                    description || null,

                assessment_type:
                    assessmentType,

                subject_id:
                    Number(subjectId),

                level:
                    level,

                duration_minutes:
                    duration,

                published:
                    published,

                created_by:
                    user.id

            }])
            .select()
            .single();


        // ========================================
        // HANDLE ERROR
        // ========================================

        if (error) {

            console.error(
                "Create test/exam error:",
                error
            );

            showMessage(
                "Unable to create " +
                assessmentType.toLowerCase() +
                ". " +
                error.message,
                "error"
            );

            createBtn.disabled = false;

            createBtn.textContent =
                "Create Test";

            return;
        }


        // ========================================
        // VERIFY CREATED TEST / EXAM
        // ========================================

        console.log(
            "Assessment created successfully:",
            test
        );


        if (!test || !test.id) {

            console.error(
                "Assessment was created but no ID was returned:",
                test
            );

            showMessage(
                "The assessment was created, but its ID could not be found.",
                "error"
            );

            createBtn.disabled = false;

            createBtn.textContent =
                "Create Test";

            return;
        }


        // ========================================
        // SUCCESS MESSAGE
        // ========================================

        showMessage(
            `${assessmentType} created successfully.`,
            "success"
        );


        createBtn.textContent =
            "Created Successfully";


        // ========================================
        // OPEN QUESTION BUILDER
        // ========================================

        setTimeout(() => {

            const testUrl =
                "teacher-test-questions.html?id=" +
                encodeURIComponent(test.id);

            console.log(
                "Opening Question Builder:",
                testUrl
            );

            window.location.href =
                testUrl;

        }, 1000);

    }
);


// ========================================
// START PAGE
// ========================================

initializePage();