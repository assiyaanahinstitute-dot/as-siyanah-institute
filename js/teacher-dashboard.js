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
// GET CURRENT TEACHER
// ==========================================

async function getCurrentTeacher() {

    const {
        data: { session },
        error: sessionError
    } = await supabaseClient.auth.getSession();


    if (sessionError) {
        throw new Error(
            "Unable to verify your session."
        );
    }


    if (!session) {

        window.location.href =
            "teacher-login.html";

        throw new Error(
            "Teacher is not logged in."
        );
    }


    const {
        data: teacher,
        error: teacherError
    } = await supabaseClient
        .from("Teachers")
        .select(`
            id,
            auth_id,
            full_name,
            role
        `)
        .eq(
            "auth_id",
            session.user.id
        )
        .eq(
            "role",
            "teacher"
        )
        .maybeSingle();


    if (teacherError) {

        console.error(
            "Teacher verification error:",
            teacherError
        );

        throw new Error(
            "Unable to verify teacher account."
        );
    }


    if (!teacher) {

        await supabaseClient.auth.signOut();

        window.location.href =
            "teacher-login.html";

        throw new Error(
            "Teacher account not found."
        );
    }


    return teacher;
}


// ==========================================
// CHECK TEACHER LOGIN
// ==========================================

async function checkTeacherLogin() {

    try {

        const teacher =
            await getCurrentTeacher();


        console.log(
            "Teacher logged in:",
            teacher.full_name,
            "Teacher ID:",
            teacher.id
        );


        await loadDashboardStats(
            teacher
        );

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

async function loadDashboardStats(
    teacher
) {

    try {

        // ==================================
        // GET TEACHER'S CLASSES
        // ==================================

        const {
            data: teacherClasses,
            error: classError
        } = await supabaseClient
            .from("Teacher_Classes")
            .select(`
                id
            `)
            .eq(
                "teacher_id",
                teacher.id
            );


        if (classError) {

            console.error(
                "Teacher classes error:",
                classError
            );

            throw classError;
        }


        const classIds =
            (teacherClasses || [])
                .map(
                    item => item.id
                );


        console.log(
            "Teacher class IDs:",
            classIds
        );


        // ==================================
        // TOTAL STUDENTS
        // ==================================

        let studentCount = 0;


        if (classIds.length > 0) {

            const {
                data: classStudents,
                error: classStudentError
            } = await supabaseClient
                .from("Class_Students")
                .select(`
                    student_id
                `)
                .in(
                    "class_id",
                    classIds
                );


            if (classStudentError) {

                console.error(
                    "Class students error:",
                    classStudentError
                );

            } else {

                const uniqueStudentIds =
                    new Set(
                        (classStudents || [])
                            .map(
                                item =>
                                    item.student_id
                            )
                    );


                studentCount =
                    uniqueStudentIds.size;
            }
        }


        document.getElementById(
            "totalStudents"
        ).textContent =
            studentCount;


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

        const {
            count: resultCount,
            error: resultError
        } = await supabaseClient
            .from("Results")
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


        if (resultError) {

            console.error(
                "Result count error:",
                resultError
            );

        } else {

            document.getElementById(
                "totalResults"
            ).textContent =
                resultCount ?? 0;
        }


        // ==================================
        // ASSIGNMENT SUBMISSIONS
        // ==================================
        //
        // We are leaving this temporarily
        // until assignment ownership is
        // connected to teachers.
        //
        // ==================================

        document.getElementById(
            "totalSubmissions"
        ).textContent = 0;


        // ==================================
        // TOTAL ANNOUNCEMENTS
        // ==================================
        //
        // Announcements are global, so
        // these remain global.
        //
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
                <p style="
                    color:#b42318;
                ">
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
                    document.createElement("div");


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
                                ${announcement.audience || "All"}
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


                container.appendChild(item);

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