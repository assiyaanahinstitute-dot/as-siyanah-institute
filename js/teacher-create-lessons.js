// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER PORTAL - CREATE LESSON
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
// CHECK TEACHER LOGIN
// ========================================

async function checkTeacherLogin() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();


    if (error || !user) {

        alert(
            "Your teacher session has expired. Please login again."
        );

        window.location.href =
            "teacher-login.html";

        return null;
    }


    console.log(
        "Logged-in teacher:",
        user.email
    );

    console.log(
        "Teacher Auth ID:",
        user.id
    );


    // ========================================
    // GET TEACHER RECORD
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

        alert(
            "Unable to verify your teacher account."
        );

        return null;
    }


    if (!teacher) {

        alert(
            "Your account is not registered as a teacher."
        );

        await supabaseClient.auth.signOut();

        window.location.href =
            "teacher-login.html";

        return null;
    }


    console.log(
        "Teacher verified:",
        teacher
    );


    return teacher;
}


// ========================================
// LOAD SUBJECTS
// ========================================

async function loadSubjects() {

    const subjectSelect =
        document.getElementById(
            "lessonSubject"
        );


    try {

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
                "Load subjects error:",
                error
            );

            subjectSelect.innerHTML =
                `<option value="">
                    Unable to load subjects
                </option>`;

            return;
        }


        subjectSelect.innerHTML =
            `<option value="">
                Select a subject
            </option>`;


        if (!subjects || subjects.length === 0) {

            subjectSelect.innerHTML =
                `<option value="">
                    No active subjects available
                </option>`;

            return;
        }


        subjects.forEach(function (subject) {

            const option =
                document.createElement("option");

            option.value =
                subject.id;

            option.textContent =
                subject.name;

            option.dataset.name =
                subject.name;

            subjectSelect.appendChild(
                option
            );

        });


        console.log(
            "Subjects loaded:",
            subjects
        );


    } catch (error) {

        console.error(
            "Unexpected subject loading error:",
            error
        );

        subjectSelect.innerHTML =
            `<option value="">
                Unable to load subjects
            </option>`;
    }
}


// ========================================
// FORM
// ========================================

const createLessonForm =
    document.getElementById(
        "createLessonForm"
    );


// ========================================
// CREATE LESSON
// ========================================

createLessonForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // ========================================
        // CHECK LOGIN + GET TEACHER ID
        // ========================================

        const teacher =
            await checkTeacherLogin();


        if (!teacher) {
            return;
        }


        // ========================================
        // GET SELECTED SUBJECT
        // ========================================

        const subjectSelect =
            document.getElementById(
                "lessonSubject"
            );


        const subjectId =
            subjectSelect.value;


        const selectedOption =
            subjectSelect.options[
                subjectSelect.selectedIndex
            ];


        const subjectName =
            selectedOption
                ? selectedOption.dataset.name
                : "";


        // ========================================
        // OTHER FORM VALUES
        // ========================================

        const level =
            document.getElementById(
                "lessonLevel"
            ).value;


        const title =
            document.getElementById(
                "lessonTitle"
            ).value.trim();


        const description =
            document.getElementById(
                "lessonDescription"
            ).value.trim();


        const videoUrl =
            document.getElementById(
                "lessonVideo"
            ).value.trim();


        const published =
            document.getElementById(
                "lessonPublished"
            ).checked;


        // ========================================
        // VALIDATION
        // ========================================

        if (!subjectId || !subjectName) {

            alert(
                "Please select a subject."
            );

            return;
        }


        if (!level) {

            alert(
                "Please select a level."
            );

            return;
        }


        if (!title) {

            alert(
                "Please enter a lesson title."
            );

            return;
        }


        // ========================================
        // BUTTON
        // ========================================

        const button =
            createLessonForm.querySelector(
                "button[type='submit']"
            );


        button.disabled = true;

        button.textContent =
            "Creating Lesson...";


        try {

            // ========================================
            // INSERT LESSON
            // ========================================

            const {
                data,
                error
            } = await supabaseClient
                .from("Lessons")
                .insert([
                    {
                        teacher_id: teacher.id,

                        subject: subjectName,

                        subject_id: parseInt(
                            subjectId,
                            10
                        ),

                        level: level,

                        title: title,

                        description: description,

                        video_url:
                            videoUrl || null,

                        published: published
                    }
                ])
                .select();


            // ========================================
            // ERROR
            // ========================================

            if (error) {

                console.error(
                    "Create lesson error:",
                    error
                );

                alert(
                    "Unable to create lesson:\n\n" +
                    error.message
                );

                return;
            }


            // ========================================
            // SUCCESS
            // ========================================

            console.log(
                "Lesson created:",
                data
            );


            alert(
                "Lesson created successfully!"
            );


            createLessonForm.reset();


        } catch (error) {

            console.error(
                "Unexpected error:",
                error
            );

            alert(
                "Something went wrong while creating the lesson."
            );

        } finally {

            button.disabled = false;

            button.textContent =
                "Create Lesson";
        }

    }
);


// ========================================
// LOAD SUBJECTS
// ========================================

loadSubjects();