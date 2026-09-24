// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER PORTAL — ANNOUNCEMENTS
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
// ELEMENTS
// ========================================

const announcementForm =
    document.getElementById("announcementForm");

const announcementsList =
    document.getElementById("teacherAnnouncementsList");


// ========================================
// ESCAPE HTML
// Prevent announcement text from becoming HTML
// ========================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ========================================
// CHECK TEACHER
// ========================================

async function checkTeacher() {

    const {
        data: { user },
        error: authError
    } = await supabaseClient.auth.getUser();


    if (authError || !user) {

        alert(
            "Your teacher session has expired. Please login again."
        );

        window.location.href =
            "teacher-login.html";

        return false;
    }


    const {
        data: teacher,
        error: teacherError
    } = await supabaseClient
        .from("Teachers")
        .select("auth_id, role")
        .eq("auth_id", user.id)
        .eq("role", "teacher")
        .maybeSingle();


    if (teacherError) {

        console.error(
            "Teacher verification error:",
            teacherError
        );

        alert(
            "Unable to verify your teacher account."
        );

        return false;
    }


    if (!teacher) {

        alert(
            "You are not registered as a teacher."
        );

        return false;
    }


    return true;
}


// ========================================
// UPDATE STATISTICS
// ========================================

function updateStatistics(announcements) {

    const total =
        announcements.length;

    const published =
        announcements.filter(
            announcement =>
                announcement.published === true
        ).length;

    const drafts =
        total - published;


    const totalElement =
        document.getElementById(
            "announcementTotal"
        );

    const publishedElement =
        document.getElementById(
            "announcementPublishedCount"
        );

    const draftElement =
        document.getElementById(
            "announcementDraftCount"
        );


    if (totalElement) {
        totalElement.textContent = total;
    }

    if (publishedElement) {
        publishedElement.textContent = published;
    }

    if (draftElement) {
        draftElement.textContent = drafts;
    }
}


// ========================================
// CREATE ANNOUNCEMENT
// ========================================

if (announcementForm) {

    announcementForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const teacherVerified =
                await checkTeacher();

            if (!teacherVerified) return;


            const title =
                document
                    .getElementById("announcementTitle")
                    .value
                    .trim();


            const category =
                document
                    .getElementById("announcementCategory")
                    .value;


            const message =
                document
                    .getElementById("announcementMessage")
                    .value
                    .trim();


            const audience =
                document
                    .getElementById("announcementAudience")
                    .value;


            const published =
                document
                    .getElementById("announcementPublished")
                    .checked;


            if (!title) {

                alert(
                    "Please enter an announcement title."
                );

                return;
            }


            if (!category) {

                alert(
                    "Please select a category."
                );

                return;
            }


            if (!message) {

                alert(
                    "Please enter the announcement message."
                );

                return;
            }


            const button =
                document.getElementById(
                    "saveAnnouncementButton"
                );


            const originalButtonHTML =
                button.innerHTML;


            button.disabled = true;

            button.innerHTML =
                "<span>⏳</span> Publishing...";


            try {

                const {
                    data,
                    error
                } = await supabaseClient
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
                    .select();


                if (error) {

                    console.error(
                        "Create announcement error:",
                        error
                    );

                    alert(
                        "Unable to create announcement:\n\n" +
                        error.message
                    );

                    return;
                }


                console.log(
                    "Announcement created:",
                    data
                );


                alert(
                    published
                        ? "Announcement published successfully!"
                        : "Announcement saved as draft successfully!"
                );


                announcementForm.reset();


                document
                    .getElementById(
                        "announcementPublished"
                    )
                    .checked = true;


                await loadAnnouncements();


            } catch (error) {

                console.error(
                    "Unexpected error:",
                    error
                );

                alert(
                    "Something went wrong while creating the announcement."
                );

            } finally {

                button.disabled = false;

                button.innerHTML =
                    originalButtonHTML;
            }

        }
    );

}


// ========================================
// LOAD ANNOUNCEMENTS
// ========================================

async function loadAnnouncements() {

    if (!announcementsList) return;


    announcementsList.innerHTML = `
        <div class="announcement-loading">

            <div class="announcement-loader"></div>

            <p>
                Loading announcements...
            </p>

        </div>
    `;


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
            );


        if (error) {

            console.error(
                "Load announcements error:",
                error
            );


            announcementsList.innerHTML = `
                <div class="announcement-error">

                    <strong>
                        Unable to load announcements.
                    </strong>

                    <br>

                    ${escapeHTML(error.message)}

                </div>
            `;

            return;
        }


        const announcementData =
            announcements || [];


        updateStatistics(
            announcementData
        );


        if (announcementData.length === 0) {

            announcementsList.innerHTML = `
                <div class="announcement-empty">

                    <div class="announcement-empty-icon">
                        📢
                    </div>

                    <h3>
                        No Announcements Yet
                    </h3>

                    <p>
                        Create your first announcement using the form above.
                    </p>

                </div>
            `;

            return;
        }


        announcementsList.innerHTML = "";


        announcementData.forEach(
            function (announcement) {

                const card =
                    document.createElement("article");


                card.className =
                    "teacher-announcement-item";


                const status =
                    announcement.published
                        ? "Published"
                        : "Draft";


                const statusClass =
                    announcement.published
                        ? "published"
                        : "draft";


                const category =
                    escapeHTML(
                        announcement.category ||
                        "General"
                    );


                const title =
                    escapeHTML(
                        announcement.title ||
                        "Announcement"
                    );


                const message =
                    escapeHTML(
                        announcement.message ||
                        ""
                    );


                const audience =
                    escapeHTML(
                        announcement.audience ||
                        "All Students"
                    );


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
                        : "Date unavailable";


                const editUrl =
                    "teacher-edit-announcement.html?" +
                    new URLSearchParams({
                        id: String(
                            announcement.id
                        )
                    }).toString();


                card.innerHTML = `

                    <div class="teacher-announcement-top">

                        <div class="teacher-announcement-main">

                            <span class="teacher-announcement-category">
                                ${category}
                            </span>

                            <h3 class="teacher-announcement-title">
                                ${title}
                            </h3>

                            <p class="teacher-announcement-message">
                                ${message}
                            </p>

                        </div>


                        <span
                            class="teacher-announcement-status ${statusClass}"
                        >
                            ${status}
                        </span>

                    </div>


                    <div class="teacher-announcement-divider"></div>


                    <div class="teacher-announcement-bottom">

                        <div class="teacher-announcement-meta">

                            <div>
                                <strong>Audience:</strong>
                                ${audience}
                            </div>

                            <div>
                                <strong>Created:</strong>
                                ${escapeHTML(date)}
                            </div>

                        </div>


                        <div class="teacher-announcement-actions">

                            <a
                                href="${editUrl}"
                                class="teacher-edit-btn"
                            >
                                ✏️ Edit
                            </a>


                            <button
                                type="button"
                                class="teacher-toggle-btn"
                                data-action="toggle"
                                data-id="${escapeHTML(announcement.id)}"
                                data-status="${announcement.published}"
                            >
                                ${announcement.published
                                    ? "Unpublish"
                                    : "Publish"}
                            </button>


                            <button
                                type="button"
                                class="teacher-delete-btn"
                                data-action="delete"
                                data-id="${escapeHTML(announcement.id)}"
                            >
                                🗑️ Delete
                            </button>

                        </div>

                    </div>

                `;


                announcementsList.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Announcements error:",
            error
        );


        announcementsList.innerHTML = `
            <div class="announcement-error">

                Something went wrong while loading announcements.

            </div>
        `;
    }
}


// ========================================
// ACTION BUTTONS
// Event delegation
// ========================================

if (announcementsList) {

    announcementsList.addEventListener(
        "click",
        async function (event) {

            const button =
                event.target.closest(
                    "button[data-action]"
                );


            if (!button) return;


            const action =
                button.dataset.action;


            const id =
                button.dataset.id;


            if (!id) return;


            if (action === "toggle") {

                const currentStatus =
                    button.dataset.status === "true";


                await togglePublished(
                    id,
                    currentStatus
                );

            }


            if (action === "delete") {

                await deleteAnnouncement(
                    id
                );

            }

        }
    );

}


// ========================================
// PUBLISH / UNPUBLISH
// ========================================

async function togglePublished(
    id,
    currentStatus
) {

    const teacherVerified =
        await checkTeacher();

    if (!teacherVerified) return;


    const newStatus =
        !currentStatus;


    const action =
        newStatus
            ? "publish"
            : "unpublish";


    const confirmed =
        confirm(
            `Are you sure you want to ${action} this announcement?`
        );


    if (!confirmed) return;


    const {
        error
    } = await supabaseClient
        .from("Announcements")
        .update({
            published: newStatus
        })
        .eq("id", id);


    if (error) {

        console.error(
            "Publish update error:",
            error
        );

        alert(
            "Unable to update announcement:\n\n" +
            error.message
        );

        return;
    }


    alert(
        newStatus
            ? "Announcement published successfully!"
            : "Announcement unpublished successfully!"
    );


    await loadAnnouncements();
}


// ========================================
// DELETE ANNOUNCEMENT
// ========================================

async function deleteAnnouncement(id) {

    const teacherVerified =
        await checkTeacher();

    if (!teacherVerified) return;


    const confirmed =
        confirm(
            "Are you sure you want to delete this announcement?\n\nThis action cannot be undone."
        );


    if (!confirmed) return;


    const {
        error
    } = await supabaseClient
        .from("Announcements")
        .delete()
        .eq("id", id);


    if (error) {

        console.error(
            "Delete announcement error:",
            error
        );

        alert(
            "Unable to delete announcement:\n\n" +
            error.message
        );

        return;
    }


    alert(
        "Announcement deleted successfully!"
    );


    await loadAnnouncements();
}


// ========================================
// LOGOUT
// ========================================

const logoutButton =
    document.getElementById("logoutBtn");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) return;


            logoutButton.disabled = true;

            logoutButton.textContent =
                "Logging out...";


            const {
                error
            } = await supabaseClient.auth.signOut();


            if (error) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "Unable to logout. Please try again."
                );

                logoutButton.disabled = false;

                logoutButton.textContent =
                    "Logout";

                return;
            }


            window.location.href =
                "teacher-login.html";

        }
    );

}


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const teacherVerified =
            await checkTeacher();


        if (!teacherVerified) return;


        await loadAnnouncements();

    }
);