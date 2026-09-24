// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER PORTAL - MANAGE LESSONS
// ========================================

// ========================================
// SUPABASE CONNECTION
// ========================================

const SUPABASE_URL =
    "https://ridyfpaqoyegdvqmkiyl.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_dH1z6RuBIqxN88pyG9YfVA_1niXEWIh";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ========================================
// GET LOGGED-IN TEACHER
// ========================================

async function getLoggedInTeacher() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        window.location.href =
            "teacher-login.html";

        return null;
    }


    const {
        data: teacher,
        error: teacherError
    } = await supabaseClient
        .from("Teachers")
        .select("id, auth_id, full_name, role")
        .eq("auth_id", user.id)
        .eq("role", "teacher")
        .maybeSingle();


    if (teacherError) {

        console.error(
            "Teacher lookup error:",
            teacherError
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


    return teacher;
}


// ========================================
// LOAD LESSONS
// ========================================

async function loadTeacherLessons() {

    const lessonsList =
        document.getElementById(
            "teacherLessonsList"
        );

    const totalLessons =
        document.getElementById(
            "totalLessons"
        );

    const publishedLessons =
        document.getElementById(
            "publishedLessons"
        );

    const draftLessons =
        document.getElementById(
            "draftLessons"
        );


    if (!lessonsList) return;


    try {

        console.log(
            "Loading teacher lessons..."
        );


        // ========================================
        // GET LOGGED-IN TEACHER
        // ========================================

        const teacher =
            await getLoggedInTeacher();


        if (!teacher) {
            return;
        }


        console.log(
            "Current teacher:",
            teacher
        );


        // ========================================
        // GET ONLY THIS TEACHER'S LESSONS
        // ========================================

        const {
            data: lessons,
            error
        } = await supabaseClient
            .from("Lessons")
            .select(`
                id,
                title,
                description,
                subject,
                subject_id,
                level,
                video_url,
                published,
                teacher_id,
                Subjects (
                    id,
                    name
                )
            `)
            .eq(
                "teacher_id",
                teacher.id
            )
            .order(
                "id",
                {
                    ascending: false
                }
            );


        // ========================================
        // CHECK ERROR
        // ========================================

        if (error) {

            console.error(
                "Unable to load lessons:",
                error
            );


            lessonsList.innerHTML = `
                <div
                    style="
                        text-align:center;
                        padding:30px;
                    "
                >

                    <h3>
                        Unable to load lessons
                    </h3>

                    <p>
                        ${error.message}
                    </p>

                </div>
            `;

            return;
        }


        console.log(
            "Teacher lessons loaded:",
            lessons
        );


        // ========================================
        // STATISTICS
        // ========================================

        const total =
            lessons.length;


        const published =
            lessons.filter(
                lesson =>
                    lesson.published === true
            ).length;


        const drafts =
            total - published;


        if (totalLessons) {

            totalLessons.textContent =
                total;
        }


        if (publishedLessons) {

            publishedLessons.textContent =
                published;
        }


        if (draftLessons) {

            draftLessons.textContent =
                drafts;
        }


        // ========================================
        // NO LESSONS
        // ========================================

        if (lessons.length === 0) {

            lessonsList.innerHTML = `
                <div
                    style="
                        text-align:center;
                        padding:40px;
                    "
                >

                    <div style="font-size:45px;">
                        📚
                    </div>

                    <h3>
                        No Lessons Yet
                    </h3>

                    <p>
                        You have not created any lessons yet.
                    </p>

                    <a
                        href="teacher-create-lesson.html"
                        class="btn btn-primary"
                    >
                        + Create Lesson
                    </a>

                </div>
            `;

            return;
        }


        // ========================================
        // CLEAR LIST
        // ========================================

        lessonsList.innerHTML = "";


        // ========================================
        // DISPLAY LESSONS
        // ========================================

        lessons.forEach(
            function (lesson) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.style.cssText = `
                    background:#fff;
                    border:1px solid #e5e5e5;
                    border-radius:16px;
                    padding:25px;
                    margin-bottom:20px;
                    box-shadow:0 5px 18px rgba(0,0,0,0.05);
                `;


                // ========================================
                // STATUS
                // ========================================

                const status =
                    lesson.published
                        ? "Published"
                        : "Draft";


                const statusBackground =
                    lesson.published
                        ? "#1d5e3c"
                        : "#8a6d1d";


                // ========================================
                // DESCRIPTION
                // ========================================

                const description =
                    lesson.description ||
                    "No description available.";


                // ========================================
                // SUBJECT NAME
                // ========================================

                const subjectName =
                    lesson.Subjects &&
                    lesson.Subjects.name
                        ? lesson.Subjects.name
                        : lesson.subject || "—";


                // ========================================
                // CARD
                // ========================================

                card.innerHTML = `

                    <div
                        style="
                            display:flex;
                            justify-content:space-between;
                            align-items:flex-start;
                            gap:20px;
                            flex-wrap:wrap;
                        "
                    >

                        <div>

                            <h2
                                style="
                                    margin:0 0 10px;
                                    color:#173b29;
                                "
                            >
                                ${lesson.title || "Untitled Lesson"}
                            </h2>


                            <p
                                style="
                                    margin:6px 0;
                                    color:#555;
                                "
                            >
                                <strong>
                                    Subject:
                                </strong>

                                ${subjectName}
                            </p>


                            <p
                                style="
                                    margin:6px 0;
                                    color:#555;
                                "
                            >
                                <strong>
                                    Level:
                                </strong>

                                ${lesson.level || "—"}
                            </p>


                            <p
                                style="
                                    margin:12px 0 0;
                                    color:#777;
                                    line-height:1.6;
                                "
                            >
                                ${description}
                            </p>

                        </div>


                        <span
                            style="
                                background:${statusBackground};
                                color:white;
                                padding:7px 14px;
                                border-radius:20px;
                                font-size:13px;
                                font-weight:700;
                                white-space:nowrap;
                            "
                        >
                            ${status}
                        </span>

                    </div>


                    <hr
                        style="
                            margin:20px 0;
                            border:none;
                            border-top:1px solid #eee;
                        "
                    >


                    <div
                        style="
                            display:flex;
                            gap:10px;
                            flex-wrap:wrap;
                        "
                    >

                        <a
                            href="teacher-edit-lesson.html?id=${lesson.id}"
                            class="btn btn-primary"
                        >
                            Edit Lesson
                        </a>


                        <a
                            href="lesson.html?id=${lesson.id}"
                            class="btn btn-secondary"
                            target="_blank"
                        >
                            View Lesson
                        </a>

                    </div>

                `;


                lessonsList.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Teacher lessons error:",
            error
        );


        lessonsList.innerHTML = `
            <div
                style="
                    text-align:center;
                    padding:30px;
                "
            >

                <h3>
                    Something Went Wrong
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>
        `;

    }

}


// ========================================
// START PAGE
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Teacher Lessons page loaded."
        );

        loadTeacherLessons();

    }
);