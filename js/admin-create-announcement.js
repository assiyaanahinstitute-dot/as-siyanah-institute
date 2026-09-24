document.addEventListener("DOMContentLoaded", async function () {

    const form =
        document.getElementById(
            "announcementForm"
        );

    const formMessage =
        document.getElementById(
            "announcementFormMessage"
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
    // CREATE ANNOUNCEMENT
    // ========================================

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // Get form values

            const title =
                document.getElementById(
                    "announcementTitle"
                ).value.trim();

            const category =
                document.getElementById(
                    "announcementCategory"
                ).value;

            const message =
                document.getElementById(
                    "announcementMessage"
                ).value.trim();

            const audience =
                document.getElementById(
                    "announcementAudience"
                ).value;

            const published =
                document.getElementById(
                    "announcementPublished"
                ).checked;


            // ========================================
            // VALIDATION
            // ========================================

            if (
                !title ||
                !category ||
                !message ||
                !audience
            ) {

                formMessage.textContent =
                    "Please fill in all required fields.";

                formMessage.style.color =
                    "#b42318";

                return;
            }


            // ========================================
            // BUTTON
            // ========================================

            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );

            submitButton.disabled = true;

            submitButton.textContent =
                "Creating...";


            formMessage.textContent =
                "Creating announcement...";

            formMessage.style.color =
                "#718078";


            // ========================================
            // INSERT INTO DATABASE
            // ========================================

            const { data, error } =
                await supabaseClient
                    .from("Announcements")
                    .insert([
                        {
                            title: title,
                            category: category,
                            message: message,
                            audience: audience,
                            published: published
                        }
                    ])
                    .select()
                    .single();


            // ========================================
            // HANDLE ERROR
            // ========================================

            if (error) {

                console.error(
                    "Announcement creation error:",
                    error
                );

                formMessage.textContent =
                    "Unable to create announcement: " +
                    error.message;

                formMessage.style.color =
                    "#b42318";

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Create Announcement";

                return;
            }


            // ========================================
            // SUCCESS
            // ========================================

            console.log(
                "Announcement created:",
                data
            );


            formMessage.textContent =
                "Announcement created successfully!";

            formMessage.style.color =
                "#1d5e3c";


            // Redirect after short delay

            setTimeout(function () {

                window.location.href =
                    "admin-announcements.html";

            }, 1000);

        }
    );

});