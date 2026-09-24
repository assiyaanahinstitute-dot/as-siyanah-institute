document.addEventListener("DOMContentLoaded", async function () {

    const announcementMessage =
        document.getElementById(
            "announcementMessage"
        );

    const announcementDetails =
        document.getElementById(
            "announcementDetails"
        );


    // ========================================
    // CHECK ADMIN LOGIN
    // ========================================

    const { data: sessionData } =
        await supabaseClient.auth.getSession();

    if (!sessionData.session) {
        window.location.href =
            "admin-login.html";
        return;
    }


    // ========================================
    // GET ANNOUNCEMENT ID
    // ========================================

    const params =
        new URLSearchParams(
            window.location.search
        );

    const announcementId =
        params.get("id");


    if (!announcementId) {

        announcementMessage.textContent =
            "Announcement ID was not provided.";

        return;
    }


    // ========================================
    // LOAD ANNOUNCEMENT
    // ========================================

    const { data: announcement, error } =
        await supabaseClient
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
            .eq("id", announcementId)
            .single();


    if (error) {

        console.error(
            "Announcement loading error:",
            error
        );

        announcementMessage.textContent =
            "Unable to load announcement: " +
            error.message;

        return;
    }


    if (!announcement) {

        announcementMessage.textContent =
            "Announcement not found.";

        return;
    }


    // ========================================
    // DISPLAY HEADER
    // ========================================

    document.getElementById(
        "announcementName"
    ).textContent =
        announcement.title || "N/A";


    document.getElementById(
        "announcementCategory"
    ).textContent =
        announcement.category || "N/A";


    // ========================================
    // DISPLAY DETAILS
    // ========================================

    document.getElementById(
        "announcementId"
    ).textContent =
        announcement.id || "N/A";


    document.getElementById(
        "announcementTitle"
    ).textContent =
        announcement.title || "N/A";


    document.getElementById(
        "announcementCategoryDetail"
    ).textContent =
        announcement.category || "N/A";


    document.getElementById(
        "announcementAudience"
    ).textContent =
        announcement.audience || "N/A";


    document.getElementById(
        "announcementPublished"
    ).textContent =
        announcement.published
            ? "Published"
            : "Draft";


    // ========================================
    // CREATED DATE
    // ========================================

    const createdDate =
        announcement.created_at
            ? new Date(
                announcement.created_at
            ).toLocaleDateString(
                "en-GB",
                {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                }
            )
            : "N/A";


    document.getElementById(
        "announcementCreatedAt"
    ).textContent =
        createdDate;


    // ========================================
    // MESSAGE
    // ========================================

    document.getElementById(
        "announcementFullMessage"
    ).textContent =
        announcement.message || "N/A";


    // ========================================
    // SHOW PAGE
    // ========================================

    announcementMessage.style.display =
        "none";

    announcementDetails.style.display =
        "block";

});

const editButton =
    document.getElementById(
        "editAnnouncementButton"
    );

    console.log("Edit button found:", editButton);

if (editButton) {

   editButton.addEventListener(
    "click",
    function () {

        alert("Announcement ID: " + announcement.id);

        window.location.href =
            "admin-edit-announcement.html?id=" +
            encodeURIComponent(announcement.id);

    }
);
}