document.addEventListener("DOMContentLoaded", async function () {

    const form =
        document.getElementById("editAnnouncementForm");

    const formMessage =
        document.getElementById(
            "editAnnouncementFormMessage"
        );

    const { data: sessionData } =
        await supabaseClient.auth.getSession();

    if (!sessionData.session) {
        window.location.href =
            "admin-login.html";
        return;
    }

    const params =
        new URLSearchParams(
            window.location.search
        );

    const announcementId =
        params.get("id");

    if (!announcementId) {
        formMessage.textContent =
            "Announcement ID was not provided.";

        formMessage.style.color =
            "#b42318";

        return;
    }

    formMessage.textContent =
        "Loading announcement...";

    const { data: announcement, error } =
        await supabaseClient
            .from("Announcements")
            .select(`
                id,
                title,
                category,
                message,
                audience,
                published
            `)
            .eq("id", announcementId)
            .single();

    if (error) {

        console.error(
            "Announcement loading error:",
            error
        );

        formMessage.textContent =
            "Unable to load announcement: " +
            error.message;

        formMessage.style.color =
            "#b42318";

        return;
    }

    if (!announcement) {

        formMessage.textContent =
            "Announcement not found.";

        formMessage.style.color =
            "#b42318";

        return;
    }

    document.getElementById(
        "editAnnouncementTitle"
    ).value =
        announcement.title || "";

    document.getElementById(
        "editAnnouncementCategory"
    ).value =
        announcement.category || "";

    document.getElementById(
        "editAnnouncementMessage"
    ).value =
        announcement.message || "";

    document.getElementById(
        "editAnnouncementAudience"
    ).value =
        announcement.audience || "";

    document.getElementById(
        "editAnnouncementPublished"
    ).checked =
        announcement.published === true;

    formMessage.textContent =
        "Announcement loaded.";

    formMessage.style.color =
        "#1d5e3c";


    // SAVE CHANGES
    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            formMessage.textContent =
                "Saving changes...";

            formMessage.style.color =
                "#718078";


            const title =
                document.getElementById(
                    "editAnnouncementTitle"
                ).value.trim();

            const category =
                document.getElementById(
                    "editAnnouncementCategory"
                ).value;

            const message =
                document.getElementById(
                    "editAnnouncementMessage"
                ).value.trim();

            const audience =
                document.getElementById(
                    "editAnnouncementAudience"
                ).value;

            const published =
                document.getElementById(
                    "editAnnouncementPublished"
                ).checked;


            const { error: updateError } =
                await supabaseClient
                    .from("Announcements")
                    .update({
                        title: title,
                        category: category,
                        message: message,
                        audience: audience,
                        published: published
                    })
                    .eq(
                        "id",
                        announcementId
                    );


            if (updateError) {

                console.error(
                    "Announcement update error:",
                    updateError
                );

                formMessage.textContent =
                    "Unable to save changes: " +
                    updateError.message;

                formMessage.style.color =
                    "#b42318";

                return;
            }


            formMessage.textContent =
                "Announcement updated successfully.";

            formMessage.style.color =
                "#1d5e3c";


            setTimeout(function () {

                window.location.href =
                    "admin-announcement-view.html?id=" +
                    encodeURIComponent(
                        announcementId
                    );

            }, 1000);

        }
    );

});