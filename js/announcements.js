document.addEventListener("DOMContentLoaded", async function () {

    const announcementsContainer =
        document.getElementById("announcementsContainer");

    if (!announcementsContainer) {
        return;
    }

    try {

        // Check logged-in student
        const {
            data: { user },
            error: authError
        } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            window.location.href = "login.html";
            return;
        }


        // Get student's level
        const {
            data: student,
            error: studentError
        } = await supabaseClient
            .from("Student")
            .select("level")
            .eq("auth_id", user.id)
            .maybeSingle();


        if (studentError) {

            console.error(
                "Student error:",
                studentError
            );

            announcementsContainer.innerHTML = `
                <div style="text-align:center;padding:40px;">
                    <h3>Unable to load announcements</h3>
                    <p>${studentError.message}</p>
                </div>
            `;

            return;
        }


        const studentLevel =
            student ? String(student.level || "").trim() : "";


        // Get published announcements
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
                created_at
            `)
            .eq("published", true)
            .order("created_at", {
                ascending: false
            });


        if (announcementsError) {

            console.error(
                "Announcements error:",
                announcementsError
            );

            announcementsContainer.innerHTML = `
                <div style="text-align:center;padding:40px;">
                    <h3>Unable to load announcements</h3>
                    <p>${announcementsError.message}</p>
                </div>
            `;

            return;
        }


        // Show only announcements meant for everyone
        // or the student's level
        const visibleAnnouncements =
            (announcements || []).filter(function (announcement) {

                return (
                    announcement.audience === "All" ||
                    announcement.audience === studentLevel
                );

            });


        if (visibleAnnouncements.length === 0) {

            announcementsContainer.innerHTML = `
                <div style="
                    text-align:center;
                    padding:50px 20px;
                ">

                    <div style="font-size:50px;">
                        🔔
                    </div>

                    <h3>
                        No Announcements
                    </h3>

                    <p>
                        There are no announcements
                        available for you at the moment.
                    </p>

                </div>
            `;

            return;
        }


        let html = "";


        visibleAnnouncements.forEach(function (announcement) {

            const date =
                announcement.created_at
                    ? new Date(
                        announcement.created_at
                    ).toLocaleDateString(
                        "en-GB",
                        {
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        }
                    )
                    : "";


            html += `
                <article class="announcement-card">

                    <div class="announcement-card-top">

                        <span class="announcement-category">
                            ${announcement.category || "Announcement"}
                        </span>

                        <span class="announcement-date">
                            ${date}
                        </span>

                    </div>


                    <h2>
                        ${announcement.title || "Announcement"}
                    </h2>


                    <p>
                        ${announcement.message || ""}
                    </p>

                </article>
            `;

        });


        announcementsContainer.innerHTML = html;


    } catch (error) {

        console.error(
            "Announcements page error:",
            error
        );

        announcementsContainer.innerHTML = `
            <div style="
                text-align:center;
                padding:40px;
            ">

                <h3>
                    Something went wrong
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>
        `;

    }

});