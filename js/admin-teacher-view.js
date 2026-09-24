document.addEventListener("DOMContentLoaded", async function () {

    const teacherMessage =
        document.getElementById("teacherMessage");

    const teacherDetails =
        document.getElementById("teacherDetails");


    // Check admin login
    const { data: sessionData } =
        await supabaseClient.auth.getSession();

    if (!sessionData.session) {
        window.location.href = "admin-login.html";
        return;
    }


    // Get teacher ID from URL
    const params =
        new URLSearchParams(window.location.search);

    const teacherId =
        params.get("id");


    console.log("Teacher ID:", teacherId);


    if (!teacherId) {

        teacherMessage.textContent =
            "Teacher ID was not provided.";

        return;
    }


    // Load teacher
    const { data: teacher, error } =
        await supabaseClient
            .from("Teachers")
            .select(`
                id,
                auth_id,
                full_name,
                email,
                role,
                created_at
            `)
            .eq("id", teacherId)
            .single();


    if (error) {

        console.error(
            "Teacher loading error:",
            error
        );

        teacherMessage.textContent =
            "Unable to load teacher: " +
            error.message;

        return;
    }


    if (!teacher) {

        teacherMessage.textContent =
            "Teacher not found.";

        return;
    }


    console.log("Teacher:", teacher);


    // Format date
    const joinedDate =
        teacher.created_at
            ? new Date(
                teacher.created_at
            ).toLocaleDateString(
                "en-GB",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            )
            : "N/A";


    // Display teacher
    document.getElementById(
        "teacherName"
    ).textContent =
        teacher.full_name || "N/A";


    document.getElementById(
        "teacherRole"
    ).textContent =
        teacher.role || "N/A";


    document.getElementById(
        "teacherId"
    ).textContent =
        teacher.id || "N/A";


    document.getElementById(
        "teacherFullName"
    ).textContent =
        teacher.full_name || "N/A";


    document.getElementById(
        "teacherEmail"
    ).textContent =
        teacher.email || "N/A";


    document.getElementById(
        "teacherRoleDetail"
    ).textContent =
        teacher.role || "N/A";


    document.getElementById(
        "teacherCreatedAt"
    ).textContent =
        joinedDate;


    document.getElementById(
        "teacherAuthId"
    ).textContent =
        teacher.auth_id || "N/A";


    teacherMessage.style.display =
        "none";

    teacherDetails.style.display =
        "block";

});