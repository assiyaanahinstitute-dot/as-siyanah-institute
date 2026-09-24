// ========================================
// AS-SIYĀNAH INSTITUTE
// ADMIN PORTAL — CLASS MANAGEMENT
// ========================================


// ========================================
// SUPABASE
// ========================================

const SUPABASE_URL =
    "https://ridyfpaqoyegdvqmkiyl.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_dH1z6RuBIqxN88pyG9YfVA_1niXEWIh";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ========================================
// DOM
// ========================================

const classForm =
    document.getElementById("classForm");

const classNameInput =
    document.getElementById("className");

const teacherSelect =
    document.getElementById("teacherSelect");

const subjectSelect =
    document.getElementById("subjectSelect");

const levelSelect =
    document.getElementById("levelSelect");

const studentSelect =
    document.getElementById("studentSelect");

const classesContainer =
    document.getElementById("classesContainer");

const messageBox =
    document.getElementById("message");

const totalClasses =
    document.getElementById("totalClasses");

const teachersAssigned =
    document.getElementById("teachersAssigned");

const studentAssignments =
    document.getElementById("studentAssignments");

const refreshBtn =
    document.getElementById("refreshBtn");

const logoutBtn =
    document.getElementById("logoutBtn");


// ========================================
// DATA
// ========================================

let teachers = [];
let subjects = [];
let students = [];


// ========================================
// MESSAGE
// ========================================

function showMessage(text, type = "success") {

    messageBox.textContent = text;

    messageBox.className =
        "message " + type;

    setTimeout(() => {

        messageBox.className = "message";

    }, 5000);
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
// AUTHENTICATION
// ========================================

async function checkAdmin() {

    const {
        data: {
            user
        },
        error
    } =
        await supabaseClient.auth.getUser();

    if (error || !user) {

        window.location.href =
            "admin-login.html";

        return null;
    }


    const {
        data: admin,
        error: adminError
    } =
        await supabaseClient
            .from("Admin")
            .select("id, auth_id, role")
            .eq("auth_id", user.id)
            .eq("role", "admin")
            .single();


    if (adminError || !admin) {

        alert(
            "You are not authorized to access this page."
        );

        window.location.href =
            "admin-dashboard.html";

        return null;
    }


    return user;
}


// ========================================
// LOAD TEACHERS
// ========================================

async function loadTeachers() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("Teachers")
            .select(`
                id,
                full_name,
                email,
                role
            `)
            .eq("role", "teacher")
            .order("full_name");


    if (error) {

        console.error(
            "Teacher loading error:",
            error
        );

        throw error;
    }


    teachers = data || [];


    teacherSelect.innerHTML =
        `<option value="">
            Select teacher
        </option>`;


    teachers.forEach(teacher => {

        const option =
            document.createElement("option");

        option.value =
            teacher.id;

        option.textContent =
            teacher.full_name;

        teacherSelect.appendChild(option);

    });
}


// ========================================
// LOAD SUBJECTS
// ========================================

async function loadSubjects() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("Subjects")
            .select(`
                id,
                name,
                active
            `)
            .eq("active", true)
            .order("name");


    if (error) {

        console.error(
            "Subject loading error:",
            error
        );

        throw error;
    }


    subjects = data || [];


    subjectSelect.innerHTML =
        `<option value="">
            Select subject
        </option>`;


    subjects.forEach(subject => {

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
// LOAD STUDENTS
// ========================================

async function loadStudents() {

    const {
        data,
        error
    } =
        await supabaseClient
            .from("Student")
            .select(`
                id,
                student_id,
                full_name,
                level,
                programme
            `)
            .order("full_name");


    if (error) {

        console.error(
            "Student loading error:",
            error
        );

        throw error;
    }


    students = data || [];


    studentSelect.innerHTML = "";


    students.forEach(student => {

        const option =
            document.createElement("option");

        option.value =
            student.id;

        option.textContent =
            `${student.full_name} — ${student.student_id || "No ID"}`;

        studentSelect.appendChild(option);

    });
}


// ========================================
// LOAD ALL CLASSES
// ========================================

async function loadClasses() {

    classesContainer.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading classes...</p>
        </div>
    `;


    const {
        data: classes,
        error
    } =
        await supabaseClient
            .from("Teacher_Classes")
            .select(`
                id,
                teacher_id,
                subject_id,
                level,
                class_name,
                created_at
            `)
            .order("created_at", {
                ascending: false
            });


    if (error) {

        console.error(
            "Class loading error:",
            error
        );

        showMessage(
            error.message,
            "error"
        );

        return;
    }


    if (!classes || classes.length === 0) {

        renderEmptyState();

        updateStats([]);

        return;
    }


    const classIds =
        classes.map(item => item.id);


    const {
        data: memberships,
        error: membershipError
    } =
        await supabaseClient
            .from("Class_Students")
            .select(`
                id,
                class_id,
                student_id
            `)
            .in("class_id", classIds);


    if (membershipError) {

        console.error(
            "Class student loading error:",
            membershipError
        );

        showMessage(
            membershipError.message,
            "error"
        );

        return;
    }


    renderClasses(
        classes,
        memberships || []
    );

    updateStats(
        memberships || [],
        classes
    );
}


// ========================================
// RENDER EMPTY
// ========================================

function renderEmptyState() {

    classesContainer.innerHTML = `
        <div class="empty-state">

            <div class="empty-icon">
                🏫
            </div>

            <h3>No classes yet</h3>

            <p>
                Create your first class above.
            </p>

        </div>
    `;
}


// ========================================
// RENDER CLASSES
// ========================================

function renderClasses(
    classes,
    memberships
) {

    classesContainer.innerHTML = "";


    classes.forEach(classItem => {

        const teacher =
            teachers.find(
                item =>
                    Number(item.id) ===
                    Number(classItem.teacher_id)
            );


        const subject =
            subjects.find(
                item =>
                    Number(item.id) ===
                    Number(classItem.subject_id)
            );


        const classStudents =
            memberships.filter(
                item =>
                    Number(item.class_id) ===
                    Number(classItem.id)
            );


        const studentObjects =
            classStudents
                .map(item =>
                    students.find(
                        student =>
                            Number(student.id) ===
                            Number(item.student_id)
                    )
                )
                .filter(Boolean);


        const card =
            document.createElement("div");

        card.className =
            "class-card";


        let studentsHtml = "";


        if (studentObjects.length === 0) {

            studentsHtml = `
                <div class="empty-state">
                    No students assigned.
                </div>
            `;

        } else {

            studentsHtml = `
                <div class="students-list">

                    ${studentObjects
                        .map((student, index) => `
                            <div class="student-chip">

                                <span class="student-number">
                                    ${index + 1}
                                </span>

                                ${escapeHtml(
                                    student.full_name
                                )}

                            </div>
                        `)
                        .join("")}

                </div>
            `;
        }


        card.innerHTML = `

            <div class="class-header">

                <div>

                    <h3>
                        ${escapeHtml(
                            classItem.class_name
                        )}
                    </h3>

                    <div class="class-meta">

                        <span class="class-tag">
                            👨‍🏫
                            ${escapeHtml(
                                teacher?.full_name ||
                                "Unknown Teacher"
                            )}
                        </span>

                        <span class="class-tag">
                            📚
                            ${escapeHtml(
                                subject?.name ||
                                "Unknown Subject"
                            )}
                        </span>

                        <span class="class-tag gold">
                            🎓
                            ${escapeHtml(
                                classItem.level
                            )}
                        </span>

                    </div>

                </div>


                <button
                    class="delete-class"
                    data-id="${classItem.id}"
                >
                    Delete Class
                </button>

            </div>


            <p class="students-title">
                👨‍🎓 Assigned Students
                (${studentObjects.length})
            </p>

            ${studentsHtml}

        `;


        const deleteButton =
            card.querySelector(
                ".delete-class"
            );


        deleteButton.addEventListener(
            "click",
            () =>
                deleteClass(
                    classItem.id,
                    classItem.class_name
                )
        );


        classesContainer.appendChild(card);

    });
}


// ========================================
// UPDATE STATS
// ========================================

function updateStats(
    memberships,
    classes = []
) {

    totalClasses.textContent =
        classes.length;

    const teacherIds =
        classes.map(
            item => item.teacher_id
        );

    teachersAssigned.textContent =
        new Set(
            teacherIds.map(String)
        ).size;

    studentAssignments.textContent =
        memberships.length;
}


// ========================================
// CREATE CLASS
// ========================================

classForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const className =
            classNameInput.value.trim();

        const teacherId =
            teacherSelect.value;

        const subjectId =
            subjectSelect.value;

        const level =
            levelSelect.value;


        const selectedStudents =
            Array.from(
                studentSelect.selectedOptions
            ).map(
                option =>
                    Number(option.value)
            );


        if (!className) {

            showMessage(
                "Please enter a class name.",
                "error"
            );

            return;
        }


        if (!teacherId) {

            showMessage(
                "Please select a teacher.",
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
                "Please select a level.",
                "error"
            );

            return;
        }


        if (selectedStudents.length === 0) {

            showMessage(
                "Please select at least one student.",
                "error"
            );

            return;
        }


        const button =
            document.getElementById(
                "createClassBtn"
            );


        button.disabled = true;

        button.innerHTML =
            "Creating...";


        try {

            // --------------------------------
            // CHECK DUPLICATE CLASS
            // --------------------------------

            const {
                data: existingClass,
                error: duplicateError
            } =
                await supabaseClient
                    .from("Teacher_Classes")
                    .select("id")
                    .eq(
                        "teacher_id",
                        Number(teacherId)
                    )
                    .eq(
                        "subject_id",
                        Number(subjectId)
                    )
                    .eq(
                        "level",
                        level
                    )
                    .eq(
                        "class_name",
                        className
                    )
                    .maybeSingle();


            if (duplicateError) {
                throw duplicateError;
            }


            if (existingClass) {

                throw new Error(
                    "This class already exists."
                );
            }


            // --------------------------------
            // CREATE CLASS
            // --------------------------------

            const {
                data: newClass,
                error: classError
            } =
                await supabaseClient
                    .from("Teacher_Classes")
                    .insert([{
                        teacher_id:
                            Number(teacherId),

                        subject_id:
                            Number(subjectId),

                        level:
                            level,

                        class_name:
                            className
                    }])
                    .select()
                    .single();


            if (classError) {
                throw classError;
            }


            // --------------------------------
            // ASSIGN STUDENTS
            // --------------------------------

            const studentRows =
                selectedStudents.map(
                    studentId => ({
                        class_id:
                            newClass.id,

                        student_id:
                            studentId
                    })
                );


            const {
                error:
                    studentError
            } =
                await supabaseClient
                    .from("Class_Students")
                    .insert(studentRows);


            if (studentError) {

                // Remove the class if student
                // assignment failed.

                await supabaseClient
                    .from("Teacher_Classes")
                    .delete()
                    .eq(
                        "id",
                        newClass.id
                    );

                throw studentError;
            }


            showMessage(
                "Class created successfully."
            );


            classForm.reset();


            await loadClasses();

        }

        catch (error) {

            console.error(
                "Create class error:",
                error
            );

            showMessage(
                error.message ||
                "Unable to create class.",
                "error"
            );

        }

        finally {

            button.disabled = false;

            button.innerHTML =
                "<span>＋</span> Create Class";
        }

    }
);


// ========================================
// DELETE CLASS
// ========================================

async function deleteClass(
    classId,
    className
) {

    const confirmed =
        confirm(
            `Delete "${className}"?\n\n` +
            `All student assignments for this class will also be removed.`
        );


    if (!confirmed) {
        return;
    }


    try {

        // Delete student assignments first

        const {
            error:
                membershipError
        } =
            await supabaseClient
                .from("Class_Students")
                .delete()
                .eq(
                    "class_id",
                    classId
                );


        if (membershipError) {
            throw membershipError;
        }


        // Delete class

        const {
            error:
                classError
        } =
            await supabaseClient
                .from("Teacher_Classes")
                .delete()
                .eq(
                    "id",
                    classId
                );


        if (classError) {
            throw classError;
        }


        showMessage(
            "Class deleted successfully."
        );


        await loadClasses();

    }

    catch (error) {

        console.error(
            "Delete class error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to delete class.",
            "error"
        );
    }
}


// ========================================
// REFRESH
// ========================================

refreshBtn.addEventListener(
    "click",
    async () => {

        await loadClasses();

    }
);


// ========================================
// LOGOUT
// ========================================

logoutBtn.addEventListener(
    "click",
    async () => {

        await supabaseClient.auth.signOut();

        window.location.href =
            "admin-login.html";

    }
);


// ========================================
// INITIALIZE
// ========================================

async function initialize() {

    try {

        const user =
            await checkAdmin();

        if (!user) {
            return;
        }


        await Promise.all([
            loadTeachers(),
            loadSubjects(),
            loadStudents()
        ]);


        await loadClasses();

    }

    catch (error) {

        console.error(
            "Initialization error:",
            error
        );

        showMessage(
            error.message ||
            "Unable to load class management.",
            "error"
        );
    }
}


initialize();