// ==========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER DASHBOARD
// ==========================================

const SUPABASE_URL =
    "https://ridyfpaqoyegdvqmkiyl.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_dH1z6RuBIqxN88pyG9YfVA_1niXEWIh";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ==========================================
// CHECK TEACHER LOGIN
// ==========================================

async function checkTeacherLogin() {

    try {

        const {
            data: { session },
            error
        } = await supabaseClient.auth.getSession();


        if (error) {

            console.error(
                "Session error:",
                error
            );

            return;
        }


        if (!session) {

            window.location.href =
                "teacher-login.html";

            return;
        }


        console.log(
            "Teacher logged in:",
            session.user.email
        );


        // ==================================
        // GET TEACHER RECORD
        // ==================================

        const {
            data: teacher,
            error: teacherError
        } = await supabaseClient
            .from("Teachers")
            .select("id, auth_id, full_name, role")
            .eq("auth_id", session.user.id)
            .eq("role", "teacher")
            .maybeSingle();


        if (teacherError) {

            console.error(
                "Teacher verification error:",
                teacherError
            );

            return;
        }


        if (!teacher) {

            alert(
                "You are not registered as a teacher."
            );

            await supabaseClient.auth.signOut();

            window.location.href =
                "teacher-login.html";

            return;
        }


        console.log(
            "Current teacher:",
            teacher
        );


        // Load dashboard
        await loadDashboardStats(teacher);

        await loadRecentAnnouncements();


    } catch (error) {

        console.error(
            "Teacher authentication error:",
            error
        );

    }
}


// ==========================================
// LOAD DASHBOARD STATISTICS
// ==========================================

async function loadDashboardStats(teacher) {

    try {

        // ==================================
        // GET TEACHER'S CLASSES
        // ==================================

        const {
            data: classes,
            error: classesError
        } = await supabaseClient
            .from("Teacher_Classes")
            .select(
                "id, class_name, subject_id, level"
            )
            .eq(
                "teacher_id",
                teacher.id
            );


        if (classesError) {

            console.error(
                "Teacher classes error:",
                classesError
            );

            document.getElementById(
                "totalStudents"
            ).textContent = "0";

            return;
        }


        console.log(
            "Teacher classes:",
            classes
        );


        // ==================================
        // GET STUDENTS
        // ==================================

        let studentIds = [];


        if (classes && classes.length > 0) {

            const classIds =
                classes.map(
                    item => item.id
                );


            const {
                data: classStudents,
                error: assignmentError
            } = await supabaseClient
                .from("Class_Students")
                .select(
                    "class_id, student_id"
                )
                .in(
                    "class_id",
                    classIds
                );


            if (assignmentError) {

                console.error(
                    "Student assignment error:",
                    assignmentError
                );

            } else {

                studentIds = [
                    ...new Set(
                        (classStudents || [])
                            .map(
                                item =>
                                    item.student_id
                            )
                    )
                ];

            }

        }


        // ==================================
        // TOTAL STUDENTS
        // ==================================

        const studentCount =
            studentIds.length;


        const totalStudentsElement =
            document.getElementById(
                "totalStudents"
            );


        if (totalStudentsElement) {

            totalStudentsElement.textContent =
                studentCount;
        }


        console.log(
            "Teacher student count:",
            studentCount
        );


        // ==================================
        // TOTAL LESSONS
        // ==================================

        const {
            count: lessonCount,
            error: lessonError
        } = await supabaseClient
            .from("Lessons")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            )
            .eq(
                "teacher_id",
                teacher.id
            );


        if (lessonError) {

            console.error(
                "Lesson count error:",
                lessonError
            );

        } else {

            document.getElementById(
                "totalLessons"
            ).textContent =
                lessonCount ?? 0;
        }


        // ==================================
        // PUBLISHED LESSONS
        // ==================================

        const {
            count: publishedLessonCount,
            error: publishedLessonError
        } = await supabaseClient
            .from("Lessons")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            )
            .eq(
                "teacher_id",
                teacher.id
            )
            .eq(
                "published",
                true
            );


        if (publishedLessonError) {

            console.error(
                "Published lesson count error:",
                publishedLessonError
            );

        } else {

            document.getElementById(
                "publishedLessons"
            ).textContent =
                publishedLessonCount ?? 0;
        }


        // ==================================
        // TOTAL RESULTS
        // ==================================

        /*
         * Results will be connected to teachers
         * separately.
         *
         * For now we do NOT guess the teacher
         * ownership of existing results.
         */

        const totalResultsElement =
            document.getElementById(
                "totalResults"
            );


        if (totalResultsElement) {

            totalResultsElement.textContent =
                "0";
        }


        // ==================================
        // TOTAL ASSIGNMENT SUBMISSIONS
        // ==================================

        const {
            count: submissionCount,
            error: submissionError
        } = await supabaseClient
            .from("Assignment_Submissions")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            );


        if (submissionError) {

            console.error(
                "Assignment submission count error:",
                submissionError
            );

        } else {

            const submissionElement =
                document.getElementById(
                    "totalSubmissions"
                );


            if (submissionElement) {

                submissionElement.textContent =
                    submissionCount ?? 0;
            }

        }


        // ==================================
        // TOTAL ANNOUNCEMENTS
        // ==================================

        const {
            count: announcementCount,
            error: announcementError
        } = await supabaseClient
            .from("Announcements")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            );


        if (announcementError) {

            console.error(
                "Announcement count error:",
                announcementError
            );

        } else {

            document.getElementById(
                "totalAnnouncements"
            ).textContent =
                announcementCount ?? 0;
        }


        // ==================================
        // PUBLISHED ANNOUNCEMENTS
        // ==================================

        const {
            count: publishedAnnouncementCount,
            error: publishedAnnouncementError
        } = await supabaseClient
            .from("Announcements")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            )
            .eq(
                "published",
                true
            );


        if (publishedAnnouncementError) {

            console.error(
                "Published announcement count error:",
                publishedAnnouncementError
            );

        } else {

            document.getElementById(
                "publishedAnnouncements"
            ).textContent =
                publishedAnnouncementCount ?? 0;
        }


    } catch (error) {

        console.error(
            "Dashboard statistics error:",
            error
        );

    }
}


// ==========================================
// RECENT ANNOUNCEMENTS
// ==========================================

async function loadRecentAnnouncements() {

    const container =
        document.getElementById(
            "recentAnnouncements"
        );


    if (!container) return;


    try {

        const {
            data: announcements,
            error
        } = await supabaseClient
            .from("Announcements")
            .select(`
                id,
                title,
                category,
                message,
                audience,
                published,
                created_at
            `)
            .order(
                "created_at",
                {
                    ascending: false
                }
            )
            .limit(5);


        if (error) {

            console.error(
                "Recent announcements error:",
                error
            );


            container.innerHTML = `
                <p style="color:#b42318;">
                    Unable to load recent announcements.
                </p>
            `;

            return;
        }


        if (
            !announcements ||
            announcements.length === 0
        ) {

            container.innerHTML = `
                <div style="
                    text-align:center;
                    padding:25px;
                    color:#777;
                ">

                    <div style="
                        font-size:35px;
                    ">
                        📢
                    </div>

                    <p>
                        No announcements yet.
                    </p>

                </div>
            `;

            return;
        }


        container.innerHTML = "";


        announcements.forEach(
            function (announcement) {

                const item =
                    document.createElement(
                        "div"
                    );


                item.style.cssText = `
                    padding:18px 0;
                    border-bottom:1px solid #eee;
                `;


                const date =
                    announcement.created_at
                        ? new Date(
                            announcement.created_at
                        ).toLocaleDateString(
                            "en-GB",
                            {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                            }
                        )
                        : "";


                const status =
                    announcement.published
                        ? "Published"
                        : "Draft";


                const statusColor =
                    announcement.published
                        ? "#1d5e3c"
                        : "#8a6d1d";


                item.innerHTML = `

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        gap:15px;
                        flex-wrap:wrap;
                    ">

                        <div style="
                            flex:1;
                        ">

                            <span style="
                                display:inline-block;
                                background:#eef5f1;
                                color:#1d5e3c;
                                padding:4px 10px;
                                border-radius:20px;
                                font-size:11px;
                                font-weight:700;
                            ">
                                ${announcement.category || "General"}
                            </span>


                            <h3 style="
                                margin:8px 0 5px;
                                color:#173b29;
                            ">
                                ${announcement.title || "Announcement"}
                            </h3>


                            <p style="
                                margin:0;
                                color:#666;
                                line-height:1.6;
                            ">
                                ${announcement.message || ""}
                            </p>


                            <small style="
                                display:block;
                                margin-top:8px;
                                color:#888;
                            ">
                                Audience:
                                ${announcement.audience}
                                ·
                                ${date}
                            </small>

                        </div>


                        <span style="
                            background:${statusColor};
                            color:white;
                            padding:5px 10px;
                            border-radius:20px;
                            font-size:11px;
                            font-weight:700;
                            height:max-content;
                        ">
                            ${status}
                        </span>

                    </div>

                `;


                container.appendChild(
                    item
                );

            }
        );


    } catch (error) {

        console.error(
            "Recent announcements error:",
            error
        );

    }
}


// ==========================================
// LOGOUT
// ==========================================

const logoutButton =
    document.getElementById(
        "teacherLogoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            logoutButton.disabled = true;

            logoutButton.textContent =
                "Logging out...";


            try {

                const {
                    error
                } =
                    await supabaseClient.auth.signOut();


                if (error) {
                    throw error;
                }


                window.location.href =
                    "teacher-login.html";


            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );


                alert(
                    "Unable to log out. Please try again."
                );


                logoutButton.disabled = false;

                logoutButton.textContent =
                    "Log Out";
            }

        }
    );

}


// ==========================================
// START DASHBOARD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        checkTeacherLogin();

    }
);