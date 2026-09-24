// ========================================
// AS-SIYĀNAH INSTITUTE
// ADMIN DASHBOARD
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
// CHECK ADMIN
// ========================================

async function checkAdmin() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        window.location.href = "admin-login.html";

        return null;
    }


    const { data: admin, error } =
        await supabaseClient
            .from("Admin")
            .select(`
                id,
                auth_id,
                full_name,
                email,
                role
            `)
            .eq("auth_id", user.id)
            .eq("role", "admin")
            .maybeSingle();


    if (error || !admin) {

        await supabaseClient.auth.signOut();

        window.location.href = "admin-login.html";

        return null;
    }


    return admin;
}


// ========================================
// LOAD DASHBOARD
// ========================================

async function loadDashboard() {

    const admin = await checkAdmin();

    if (!admin) return;


    // Admin name

    const adminName =
        document.getElementById("adminName");

    if (adminName) {

        adminName.textContent =
            admin.full_name || "Admin";

    }


    // ====================================
    // TOTAL STUDENTS
    // ====================================

    const { count: studentsCount } =
        await supabaseClient
            .from("Student")
            .select("id", {
                count: "exact",
                head: true
            });


    document.getElementById("totalStudents")
        .textContent = studentsCount ?? 0;


    // ====================================
    // TOTAL TEACHERS
    // ====================================

    const { count: teachersCount } =
        await supabaseClient
            .from("Teachers")
            .select("id", {
                count: "exact",
                head: true
            });


    document.getElementById("totalTeachers")
        .textContent = teachersCount ?? 0;


    // ====================================
    // TOTAL LESSONS
    // ====================================

    const { count: lessonsCount } =
        await supabaseClient
            .from("Lessons")
            .select("id", {
                count: "exact",
                head: true
            });


    document.getElementById("totalLessons")
        .textContent = lessonsCount ?? 0;


    // ====================================
    // PUBLISHED LESSONS
    // ====================================

    const { count: publishedLessonsCount } =
        await supabaseClient
            .from("Lessons")
            .select("id", {
                count: "exact",
                head: true
            })
            .eq("published", true);


    document.getElementById("publishedLessons")
        .textContent = publishedLessonsCount ?? 0;


    // ====================================
    // TOTAL RESULTS
    // ====================================

    const { count: resultsCount } =
        await supabaseClient
            .from("Results")
            .select("student_id", {
                count: "exact",
                head: true
            });


    document.getElementById("totalResults")
        .textContent = resultsCount ?? 0;


    // ====================================
    // TOTAL ANNOUNCEMENTS
    // ====================================

    const { count: announcementsCount } =
        await supabaseClient
            .from("Announcements")
            .select("id", {
                count: "exact",
                head: true
            });


    document.getElementById("totalAnnouncements")
        .textContent = announcementsCount ?? 0;


    // ====================================
    // PUBLISHED ANNOUNCEMENTS
    // ====================================

    const { count: publishedAnnouncementsCount } =
        await supabaseClient
            .from("Announcements")
            .select("id", {
                count: "exact",
                head: true
            })
            .eq("published", true);


    document.getElementById("publishedAnnouncements")
        .textContent =
            publishedAnnouncementsCount ?? 0;


    // ====================================
    // REGISTRATIONS
    // ====================================

    // Registration records are currently
    // stored in the Student table.

    document.getElementById("totalRegistrations")
        .textContent = studentsCount ?? 0;


    // ====================================
    // RECENT ANNOUNCEMENTS
    // ====================================

    const {
        data: announcements,
        error: announcementsError
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
        .order("created_at", {
            ascending: false
        })
        .limit(5);


    const recentContainer =
        document.getElementById(
            "recentAnnouncements"
        );


    if (announcementsError) {

        recentContainer.innerHTML = `
            <div class="dashboard-empty">
                Unable to load recent announcements.
            </div>
        `;

        return;
    }


    if (!announcements || announcements.length === 0) {

        recentContainer.innerHTML = `
            <div class="dashboard-empty">
                No announcements yet.
            </div>
        `;

        return;
    }


    recentContainer.innerHTML =
        announcements.map(announcement => {

            const date =
                new Date(
                    announcement.created_at
                ).toLocaleDateString(
                    "en-GB",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );


            return `

                <div class="recent-item">

                    <div class="recent-item-icon">
                        📢
                    </div>

                    <div class="recent-item-content">

                        <h3>
                            ${announcement.title}
                        </h3>

                        <p>
                            ${announcement.message}
                        </p>

                        <small>
                            ${announcement.category}
                            •
                            ${announcement.audience}
                            •
                            ${date}
                        </small>

                    </div>

                    <span class="status-badge
                        ${announcement.published
                            ? "published"
                            : "draft"}">

                        ${announcement.published
                            ? "Published"
                            : "Draft"}

                    </span>

                </div>

            `;

        }).join("");


}


// ========================================
// LOGOUT
// ========================================

async function logoutAdmin() {

    const {
        error
    } = await supabaseClient.auth.signOut();


    if (error) {

        alert(
            "Unable to logout. Please try again."
        );

        return;
    }


    window.location.href =
        "admin-login.html";
}


// ========================================
// START DASHBOARD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadDashboard();


        const logoutButton =
            document.getElementById(
                "adminLogoutButton"
            );


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logoutAdmin
            );

        }

    }
);