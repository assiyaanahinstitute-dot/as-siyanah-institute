document.addEventListener("DOMContentLoaded", async function () {

    const announcementsTableBody =
        document.getElementById(
            "announcementsTableBody"
        );

    const announcementsMessage =
        document.getElementById(
            "announcementsMessage"
        );

    const searchInput =
        document.getElementById(
            "announcementSearch"
        );

    let announcements = [];


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
    // LOAD ANNOUNCEMENTS
    // ========================================

    async function loadAnnouncements() {

        announcementsMessage.textContent =
            "Loading announcements...";

        const { data, error } =
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
                .order("id", {
                    ascending: false
                });


        if (error) {

            console.error(
                "Announcement loading error:",
                error
            );

            announcementsMessage.textContent =
                "Unable to load announcements: " +
                error.message;

            return;
        }


        announcements = data || [];


        announcementsMessage.textContent =
            announcements.length +
            " announcement(s) found.";


        displayAnnouncements(
            announcements
        );
    }


    // ========================================
    // DISPLAY ANNOUNCEMENTS
    // ========================================

    function displayAnnouncements(list) {

        announcementsTableBody.innerHTML =
            "";


        if (!list.length) {

            announcementsTableBody.innerHTML = `
                <tr>
                    <td colspan="7">
                        No announcements found.
                    </td>
                </tr>
            `;

            return;
        }


        list.forEach(function (announcement) {

            const row =
                document.createElement("tr");


            const createdDate =
                announcement.created_at
                    ? new Date(
                        announcement.created_at
                    ).toLocaleDateString(
                        "en-GB",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    )
                    : "N/A";


            row.innerHTML = `

                <td>
                    ${announcement.id || "N/A"}
                </td>

                <td>
                    ${announcement.title || "N/A"}
                </td>

                <td>
                    ${announcement.category || "N/A"}
                </td>

                <td>
                    ${announcement.audience || "N/A"}
                </td>

                <td>
                    ${
                        announcement.published
                            ? "Published"
                            : "Draft"
                    }
                </td>

                <td>
                    ${createdDate}
                </td>

                <td>

                    <button
                        type="button"
                        class="announcement-view-button"
                        data-id="${announcement.id}"
                    >
                        View
                    </button>

                </td>

            `;


            announcementsTableBody.appendChild(
                row
            );

        });
    }


    // ========================================
    // SEARCH
    // ========================================

    searchInput.addEventListener(
        "input",
        function () {

            const search =
                searchInput.value
                    .toLowerCase()
                    .trim();


            const filtered =
                announcements.filter(
                    function (announcement) {

                        return (

                            (announcement.title || "")
                                .toLowerCase()
                                .includes(search)

                            ||

                            (announcement.category || "")
                                .toLowerCase()
                                .includes(search)

                            ||

                            (announcement.audience || "")
                                .toLowerCase()
                                .includes(search)

                            ||

                            (announcement.message || "")
                                .toLowerCase()
                                .includes(search)

                        );

                    }
                );


            displayAnnouncements(
                filtered
            );

        }
    );


    // ========================================
    // VIEW ANNOUNCEMENT
    // ========================================

    announcementsTableBody.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".announcement-view-button"
                );


            if (!button) {
                return;
            }


            const announcementId =
                button.dataset.id;


            window.location.href =
                "admin-announcement-view.html?id=" +
                encodeURIComponent(
                    announcementId
                );

        }
    );


    // ========================================
    // START
    // ========================================

    await loadAnnouncements();

});