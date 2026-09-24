// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER CREATE ASSIGNMENT
// ========================================


// ========================================
// AUTHENTICATION
// ========================================

async function checkTeacher() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();


    if (error || !user) {

        window.location.href =
            "teacher-login.html";

        return null;
    }


    // ========================================
    // CHECK TEACHER RECORD
    // ========================================

    const {
        data: teacher,
        error: teacherError
    } = await supabaseClient
        .from("Teachers")
        .select(`
            id,
            auth_id,
            full_name,
            email,
            role
        `)
        .eq("auth_id", user.id)
        .eq("role", "teacher")
        .single();


    if (teacherError || !teacher) {

        alert(
            "You are not authorized to access the teacher portal."
        );

        await supabaseClient.auth.signOut();

        window.location.href =
            "teacher-login.html";

        return null;
    }


    return teacher;
}



// ========================================
// LOAD TEACHER CLASSES
// ========================================

async function loadTeacherClasses(teacherId) {

    const classSelect =
        document.getElementById("classSelect");


    classSelect.innerHTML = `
        <option value="">
            Loading classes...
        </option>
    `;


    // ========================================
    // GET TEACHER'S CLASSES
    // ========================================

    const {
        data: classes,
        error
    } = await supabaseClient
        .from("Teacher_Classes")
        .select(`
            id,
            class_name,
            subject_id,
            level
        `)
        .eq("teacher_id", teacherId)
        .order("class_name", {
            ascending: true
        });


    if (error) {

        console.error(
            "Class loading error:",
            error
        );

        classSelect.innerHTML = `
            <option value="">
                Unable to load classes
            </option>
        `;

        return;
    }


    // ========================================
    // NO CLASSES
    // ========================================

    if (!classes || classes.length === 0) {

        classSelect.innerHTML = `
            <option value="">
                No classes assigned
            </option>
        `;

        return;
    }


    // ========================================
    // POPULATE CLASSES
    // ========================================

    classSelect.innerHTML = `
        <option value="">
            Select Class
        </option>
    `;


    classes.forEach(classItem => {

        const option =
            document.createElement("option");


        option.value =
            classItem.id;


        option.textContent =
            `${classItem.class_name} — ${
                classItem.level || "Level not specified"
            }`;


        // Store subject ID for possible automatic
        // subject selection.

        if (classItem.subject_id) {

            option.dataset.subjectId =
                classItem.subject_id;

        }


        classSelect.appendChild(option);

    });


    // ========================================
    // AUTOMATIC SUBJECT + LEVEL
    // ========================================

    classSelect.addEventListener(
        "change",
        () => {

            const selectedOption =
                classSelect.options[
                    classSelect.selectedIndex
                ];


            if (!selectedOption ||
                !selectedOption.value) {

                return;
            }


            const subjectId =
                selectedOption.dataset.subjectId;


            const level =
                classes.find(
                    item =>
                        String(item.id) ===
                        String(selectedOption.value)
                )?.level;


            // Select subject automatically
            // when the class has a subject.

            if (subjectId) {

                const subjectSelect =
                    document.getElementById(
                        "subject"
                    );

                subjectSelect.value =
                    subjectId;

            }


            // Select level automatically
            // when the class has a level.

            if (level) {

                const levelSelect =
                    document.getElementById(
                        "level"
                    );

                levelSelect.value =
                    level.toLowerCase();

            }

        }
    );

}



// ========================================
// LOAD SUBJECTS
// ========================================

async function loadSubjects() {

    const subjectSelect =
        document.getElementById("subject");


    const {
        data: subjects,
        error
    } = await supabaseClient
        .from("Subjects")
        .select(`
            id,
            name,
            active
        `)
        .eq("active", true)
        .order("name", {
            ascending: true
        });


    if (error) {

        console.error(
            "Subject loading error:",
            error
        );

        subjectSelect.innerHTML = `
            <option value="">
                Unable to load subjects
            </option>
        `;

        return;
    }


    subjectSelect.innerHTML = `
        <option value="">
            Select Subject
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
// FORM SUBMISSION
// ========================================

async function createAssignment(event) {

    event.preventDefault();


    // ========================================
    // GET FORM VALUES
    // ========================================

    const title =
        document.getElementById("title")
            .value
            .trim();


    const description =
        document.getElementById("description")
            .value
            .trim();


    const classId =
        document.getElementById("classSelect")
            .value;


    const subjectId =
        document.getElementById("subject")
            .value;


    const level =
        document.getElementById("level")
            .value;


    const deadlineInput =
        document.getElementById("deadline")
            .value;


    const published =
        document.getElementById("published")
            .checked;


    const message =
        document.getElementById("formMessage");


    const button =
        document.getElementById(
            "saveAssignmentButton"
        );


    // ========================================
    // CLEAR PREVIOUS MESSAGE
    // ========================================

    message.className =
        "form-message";

    message.textContent =
        "";



    // ========================================
    // VALIDATION
    // ========================================

    if (!title) {

        showError(
            "Please enter an assignment title."
        );

        return;
    }


    if (!description) {

        showError(
            "Please enter assignment instructions."
        );

        return;
    }


    if (!classId) {

        showError(
            "Please select a class."
        );

        return;
    }


    if (!subjectId) {

        showError(
            "Please select a subject."
        );

        return;
    }


    if (!level) {

        showError(
            "Please select the student level."
        );

        return;
    }



    // ========================================
    // BUTTON STATE
    // ========================================

    button.disabled = true;

    button.textContent =
        "Creating Assignment...";



    // ========================================
    // DEADLINE
    // ========================================

    let deadline = null;


    if (deadlineInput) {

        deadline =
            new Date(
                deadlineInput
            ).toISOString();

    }



    // ========================================
    // CREATE ASSIGNMENT
    // ========================================

    const {
        data,
        error
    } = await supabaseClient
        .from("Assignments")
        .insert([
            {

                title: title,

                description: description,

                class_id:
                    Number(classId),

                subject_id:
                    Number(subjectId),

                level: level,

                deadline: deadline,

                published: published

            }
        ])
        .select()
        .single();



    // ========================================
    // HANDLE ERROR
    // ========================================

    if (error) {

        console.error(
            "Assignment creation error:",
            error
        );


        showError(
            "Unable to create assignment. " +
            error.message
        );


        button.disabled = false;

        button.textContent =
            "Create Assignment";

        return;
    }



    // ========================================
    // SUCCESS
    // ========================================

    message.className =
        "form-message success";


    message.textContent =
        "Assignment created successfully!";


    button.textContent =
        "Created ✓";



    // ========================================
    // RESET FORM
    // ========================================

    document
        .getElementById("assignmentForm")
        .reset();



    // ========================================
    // REDIRECT
    // ========================================

    setTimeout(() => {

        window.location.href =
            "teacher-assignment-submissions.html";

    }, 1200);

}



// ========================================
// ERROR MESSAGE
// ========================================

function showError(text) {

    const message =
        document.getElementById(
            "formMessage"
        );


    message.className =
        "form-message error";


    message.textContent =
        text;

}



// ========================================
// INITIALIZE PAGE
// ========================================

async function initializePage() {

    const teacher =
        await checkTeacher();


    if (!teacher) {
        return;
    }


    // Load subjects first.

    await loadSubjects();


    // Then load only this teacher's classes.

    await loadTeacherClasses(
        teacher.id
    );


    // ========================================
    // FORM SUBMIT
    // ========================================

    document
        .getElementById("assignmentForm")
        .addEventListener(
            "submit",
            createAssignment
        );

}


initializePage();