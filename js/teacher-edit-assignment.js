// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER EDIT ASSIGNMENT
// ========================================

const form = document.getElementById("editAssignmentForm");
const titleInput = document.getElementById("title");
const descriptionInput = document.getElementById("description");
const subjectSelect = document.getElementById("subject");
const levelSelect = document.getElementById("level");
const deadlineInput = document.getElementById("deadline");
const publishedInput = document.getElementById("published");
const saveBtn = document.getElementById("saveBtn");
const messageBox = document.getElementById("message");


// ========================================
// GET ASSIGNMENT ID FROM URL
// ========================================

const urlParams = new URLSearchParams(window.location.search);
const assignmentId = urlParams.get("id");


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
// AUTHENTICATION + INITIAL LOAD
// ========================================

async function initializePage() {

    if (!assignmentId) {

        showMessage(
            "No assignment was selected.",
            "error"
        );

        saveBtn.disabled = true;

        return;
    }


    const {
        data: { user },
        error: authError
    } = await supabaseClient.auth.getUser();


    if (authError || !user) {

        window.location.href = "teacher-login.html";

        return;
    }


    // ========================================
    // VERIFY TEACHER
    // ========================================

    const { data: teacher, error: teacherError } =
        await supabaseClient
            .from("Teachers")
            .select("id, auth_id, role")
            .eq("auth_id", user.id)
            .eq("role", "teacher")
            .maybeSingle();


    if (teacherError || !teacher) {

        showMessage(
            "You are not authorized to edit assignments.",
            "error"
        );

        saveBtn.disabled = true;

        return;
    }


    // ========================================
    // LOAD SUBJECTS
    // ========================================

    await loadSubjects();


    // ========================================
    // LOAD ASSIGNMENT
    // ========================================

    await loadAssignment();
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
        .order("name", { ascending: true });


    if (error) {

        console.error("Subject error:", error);

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


    subjects.forEach(subject => {

        const option = document.createElement("option");

        option.value = subject.id;
        option.textContent = subject.name;

        subjectSelect.appendChild(option);

    });
}


// ========================================
// LOAD ASSIGNMENT
// ========================================

async function loadAssignment() {

    const {
        data: assignment,
        error
    } = await supabaseClient
        .from("Assignments")
        .select(`
            id,
            title,
            description,
            subject_id,
            level,
            deadline,
            published
        `)
        .eq("id", assignmentId)
        .maybeSingle();


    if (error) {

        console.error("Assignment error:", error);

        showMessage(
            "Unable to load assignment.",
            "error"
        );

        return;
    }


    if (!assignment) {

        showMessage(
            "Assignment not found.",
            "error"
        );

        return;
    }


    // ========================================
    // FILL FORM
    // ========================================

    titleInput.value =
        assignment.title || "";


    descriptionInput.value =
        assignment.description || "";


    subjectSelect.value =
        assignment.subject_id || "";


    levelSelect.value =
        assignment.level || "";


    publishedInput.checked =
        assignment.published === true;


    // ========================================
    // DEADLINE
    // ========================================

    if (assignment.deadline) {

        const date = new Date(assignment.deadline);

        const year =
            date.getFullYear();

        const month =
            String(date.getMonth() + 1)
                .padStart(2, "0");

        const day =
            String(date.getDate())
                .padStart(2, "0");

        const hours =
            String(date.getHours())
                .padStart(2, "0");

        const minutes =
            String(date.getMinutes())
                .padStart(2, "0");

        deadlineInput.value =
            `${year}-${month}-${day}T${hours}:${minutes}`;
    }
}


// ========================================
// UPDATE ASSIGNMENT
// ========================================

form.addEventListener("submit", async function (event) {

    event.preventDefault();


    const title =
        titleInput.value.trim();

    const description =
        descriptionInput.value.trim();

    const subjectId =
        subjectSelect.value;

    const level =
        levelSelect.value;

    const deadline =
        deadlineInput.value;

    const published =
        publishedInput.checked;


    // ========================================
    // VALIDATION
    // ========================================

    if (!title) {

        showMessage(
            "Please enter an assignment title.",
            "error"
        );

        return;
    }


    if (!description) {

        showMessage(
            "Please enter the assignment instructions.",
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


    // ========================================
    // DISABLE BUTTON
    // ========================================

    saveBtn.disabled = true;

    saveBtn.textContent = "Saving...";


    // ========================================
    // PREPARE DEADLINE
    // ========================================

    let deadlineValue = null;

    if (deadline) {

        deadlineValue =
            new Date(deadline).toISOString();
    }


    // ========================================
    // UPDATE DATABASE
    // ========================================

    const {
        data,
        error
    } = await supabaseClient
        .from("Assignments")
        .update({
            title: title,
            description: description,
            subject_id: Number(subjectId),
            level: level,
            deadline: deadlineValue,
            published: published
        })
        .eq("id", assignmentId)
        .select()
        .single();


    if (error) {

        console.error("Update error:", error);

        showMessage(
            "Unable to update assignment. " +
            error.message,
            "error"
        );

        saveBtn.disabled = false;

        saveBtn.textContent = "Save Changes";

        return;
    }


    // ========================================
    // SUCCESS
    // ========================================

    console.log(
        "Assignment updated:",
        data
    );


    showMessage(
        "Assignment updated successfully.",
        "success"
    );


    saveBtn.textContent = "Saved Successfully";


    // ========================================
    // RETURN TO ASSIGNMENTS
    // ========================================

    setTimeout(() => {

        window.location.href =
            "teacher-assignments.html";

    }, 1200);

});


// ========================================
// START PAGE
// ========================================

initializePage();