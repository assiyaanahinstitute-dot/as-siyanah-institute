// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER — MY CLASSES
// ========================================

const SUPABASE_URL =
    "https://ridyfpaqoyegdvqmkiyl.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_dH1z6RuBIqxN88pyG9YfVA_1niXEWIh";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ========================================
// LOAD MY CLASSES
// ========================================

async function loadMyClasses() {

    const container =
        document.getElementById("classesContainer");

    try {

        // ----------------------------------------
        // 1. GET LOGGED-IN USER
        // ----------------------------------------

        const {
            data: { user },
            error: authError
        } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            throw new Error("Teacher is not logged in.");
        }


        // ----------------------------------------
        // 2. GET TEACHER
        // ----------------------------------------

        const {
            data: teacher,
            error: teacherError
        } = await supabaseClient
            .from("Teachers")
            .select("id, full_name, role")
            .eq("auth_id", user.id)
            .eq("role", "teacher")
            .single();

        if (teacherError || !teacher) {
            throw new Error("Teacher profile not found.");
        }


        // ----------------------------------------
        // 3. GET TEACHER CLASSES
        // ----------------------------------------

        const {
            data: classes,
            error: classesError
        } = await supabaseClient
            .from("Teacher_Classes")
            .select(`
                id,
                class_name,
                subject_id,
                level
            `)
            .eq("teacher_id", teacher.id)
            .order("id", { ascending: true });

        if (classesError) {
            throw classesError;
        }


        // ----------------------------------------
        // NO CLASSES
        // ----------------------------------------

        if (!classes || classes.length === 0) {

            document.getElementById("totalClasses")
                .textContent = "0";

            document.getElementById("totalStudents")
                .textContent = "0";

            document.getElementById("totalSubjects")
                .textContent = "0";

            container.innerHTML = `
                <div class="empty-card">
                    <h3>No Classes Assigned</h3>

                    <p>
                        You have not been assigned to any class yet.
                    </p>
                </div>
            `;

            return;
        }


        // ----------------------------------------
        // 4. GET SUBJECTS
        // ----------------------------------------

        const subjectIds = [
            ...new Set(
                classes
                    .map(item => item.subject_id)
                    .filter(Boolean)
            )
        ];


        let subjects = [];


        if (subjectIds.length > 0) {

            const {
                data: subjectData,
                error: subjectError
            } = await supabaseClient
                .from("Subjects")
                .select("id, name")
                .in("id", subjectIds);

            if (subjectError) {
                throw subjectError;
            }

            subjects = subjectData || [];
        }


        // ----------------------------------------
        // SUBJECT MAP
        // ----------------------------------------

        const subjectMap = {};

        subjects.forEach(subject => {
            subjectMap[subject.id] = subject.name;
        });


        // ----------------------------------------
        // 5. GET STUDENT ASSIGNMENTS
        // ----------------------------------------

        const classIds =
            classes.map(item => item.id);

        const {
            data: assignments,
            error: assignmentError
        } = await supabaseClient
            .from("Class_Students")
            .select("class_id, student_id")
            .in("class_id", classIds);

        if (assignmentError) {
            throw assignmentError;
        }


        // ----------------------------------------
        // COUNT STUDENTS
        // ----------------------------------------

        const studentIds = [
            ...new Set(
                (assignments || [])
                    .map(item => item.student_id)
            )
        ];


        // ----------------------------------------
        // STATS
        // ----------------------------------------

        document.getElementById("totalClasses")
            .textContent = classes.length;

        document.getElementById("totalStudents")
            .textContent = studentIds.length;

        document.getElementById("totalSubjects")
            .textContent = subjectIds.length;


        // ----------------------------------------
        // 6. CREATE CLASS CARDS
        // ----------------------------------------

        container.innerHTML = classes.map(
            (classItem, index) => {

                const studentsInClass =
                    (assignments || [])
                        .filter(
                            item =>
                                item.class_id === classItem.id
                        ).length;


                const subjectName =
                    subjectMap[classItem.subject_id]
                    || "Subject not specified";


                return `
                    <article class="class-card">

                        <div class="class-card-top">

                            <div>

                                <h3 class="class-title">
                                    ${escapeHtml(
                                        classItem.class_name
                                    )}
                                </h3>

                                <span class="class-level">
                                    ${escapeHtml(
                                        classItem.level || "—"
                                    )}
                                </span>

                            </div>

                            <div class="class-number">
                                ${String(index + 1).padStart(2, "0")}
                            </div>

                        </div>


                        <div class="class-info">

                            <div class="info-row">

                                <span class="info-label">
                                    Subject
                                </span>

                                <span class="info-value">
                                    ${escapeHtml(subjectName)}
                                </span>

                            </div>


                            <div class="info-row">

                                <span class="info-label">
                                    Level
                                </span>

                                <span class="info-value">
                                    ${escapeHtml(
                                        classItem.level || "—"
                                    )}
                                </span>

                            </div>

                        </div>


                        <div class="student-summary">

                            <span>
                                Assigned Students
                            </span>

                            <strong>
                                ${studentsInClass}
                            </strong>

                        </div>

                    </article>
                `;

            }
        ).join("");


    } catch (error) {

        console.error(
            "Teacher classes error:",
            error
        );

        document.getElementById("totalClasses")
            .textContent = "0";

        document.getElementById("totalStudents")
            .textContent = "0";

        document.getElementById("totalSubjects")
            .textContent = "0";

        container.innerHTML = `
            <div class="error-card">

                <h3>
                    Unable to Load Classes
                </h3>

                <p>
                    ${escapeHtml(
                        error.message ||
                        "Something went wrong."
                    )}
                </p>

            </div>
        `;
    }
}


// ========================================
// HTML ESCAPE
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
// LOGOUT
// ========================================

async function logoutTeacher() {

    const {
        error
    } = await supabaseClient.auth.signOut();

    if (error) {

        console.error(
            "Logout error:",
            error
        );

        return;
    }

    window.location.href =
        "teacher-login.html";
}


// ========================================
// REFRESH
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadMyClasses();


        const refreshButton =
            document.getElementById("refreshBtn");

        if (refreshButton) {

            refreshButton.addEventListener(
                "click",
                loadMyClasses
            );

        }


        const logoutButton =
            document.getElementById("logoutBtn");

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logoutTeacher
            );

        }

    }
);