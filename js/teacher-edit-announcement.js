// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER PORTAL — EDIT ANNOUNCEMENT
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
// GET ELEMENTS
// ========================================

const editForm =
    document.getElementById(
        "editAnnouncementForm"
    );

const titleInput =
    document.getElementById(
        "announcementTitle"
    );

const categoryInput =
    document.getElementById(
        "announcementCategory"
    );

const messageInput =
    document.getElementById(
        "announcementMessage"
    );

const audienceInput =
    document.getElementById(
        "announcementAudience"
    );

const publishedInput =
    document.getElementById(
        "announcementPublished"
    );

const updateButton =
    document.getElementById(
        "updateAnnouncementButton"
    );

const formMessage =
    document.getElementById(
        "formMessage"
    );


// ========================================
// GET ANNOUNCEMENT ID
// ========================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

let announcementId =
    urlParams.get("id") ||
    urlParams.get("announcementId");


// Clean the ID
if (announcementId) {

    announcementId =
        announcementId.trim();

}


// Debug information
console.log(
    "========================================"
);

console.log(
    "EDIT ANNOUNCEMENT PAGE"
);

console.log(
    "Current URL:",
    window.location.href
);

console.log(
    "URL Search:",
    window.location.search
);

console.log(
    "Announcement ID:",
    announcementId
);

console.log(
    "========================================"
);


// ========================================
// MESSAGE
// ========================================

function showMessage(
    message,
    type = "error"
) {

    if (!formMessage) return;

    formMessage.textContent =
        message;

    formMessage.className =
        `form-message show ${type}`;
}


function hideMessage() {

    if (!formMessage) return;

    formMessage.textContent =
        "";

    formMessage.className =
        "form-message";
}


// ========================================
// CHECK ID
// ========================================

function hasValidAnnouncementId() {

    return (
        announcementId !== null &&
        announcementId !== undefined &&
        announcementId !== ""
    );
}


// ========================================
// CHECK TEACHER
// ========================================

async function checkTeacher() {

    try {

        const {
            data: { user },
            error: authError
        } =
            await supabaseClient.auth.getUser();


        if (authError || !user) {

            showMessage(
                "Your teacher session has expired. Please login again.",
                "error"
            );

            setTimeout(
                function () {

                    window.location.href =
                        "teacher-login.html";

                },
                1500
            );

            return false;
        }


        const {
            data: teacher,
            error: teacherError
        } =
            await supabaseClient
                .from("Teachers")
                .select(
                    "auth_id, role"
                )
                .eq(
                    "auth_id",
                    user.id
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

            showMessage(
                "Unable to verify your teacher account.",
                "error"
            );

            return false;
        }


        if (!teacher) {

            showMessage(
                "You are not registered as a teacher.",
                "error"
            );

            return false;
        }


        return true;


    } catch (error) {

        console.error(
            "Teacher check error:",
            error
        );

        showMessage(
            "Something went wrong while verifying your teacher account.",
            "error"
        );

        return false;
    }
}


// ========================================
// LOAD ANNOUNCEMENT
// ========================================

async function loadAnnouncement() {

    if (!hasValidAnnouncementId()) {

        showMessage(
            "Announcement ID is missing. Please return to the announcements page and click Edit again.",
            "error"
        );

        if (updateButton) {

            updateButton.disabled =
                true;

        }

        return;
    }


    const teacherVerified =
        await checkTeacher();


    if (!teacherVerified) {
        return;
    }


    try {

        showMessage(
            "Loading announcement...",
            "loading"
        );


        const {
            data: announcement,
            error
        } =
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
                .eq(
                    "id",
                    announcementId
                )
                .maybeSingle();


        if (error) {

            console.error(
                "Load announcement error:",
                error
            );

            showMessage(
                "Unable to load announcement: " +
                error.message,
                "error"
            );

            return;
        }


        if (!announcement) {

            showMessage(
                "No announcement was found with ID: " +
                announcementId,
                "error"
            );

            return;
        }


        // ========================================
        // FILL FORM
        // ========================================

        titleInput.value =
            announcement.title || "";


        categoryInput.value =
            announcement.category || "";


        messageInput.value =
            announcement.message || "";


        audienceInput.value =
            announcement.audience ||
            "All Students";


        publishedInput.checked =
            announcement.published === true;


        hideMessage();


        console.log(
            "Announcement loaded successfully:",
            announcement
        );


    } catch (error) {

        console.error(
            "Unexpected load error:",
            error
        );

        showMessage(
            "Something went wrong while loading the announcement.",
            "error"
        );

    }

}


// ========================================
// UPDATE ANNOUNCEMENT
// ========================================

if (editForm) {

    editForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!hasValidAnnouncementId()) {

                showMessage(
                    "Announcement ID is missing.",
                    "error"
                );

                return;
            }


            hideMessage();


            const teacherVerified =
                await checkTeacher();


            if (!teacherVerified) {
                return;
            }


            const title =
                titleInput.value.trim();


            const category =
                categoryInput.value;


            const message =
                messageInput.value.trim();


            const audience =
                audienceInput.value;


            const published =
                publishedInput.checked;


            // ========================================
            // VALIDATION
            // ========================================

            if (!title) {

                showMessage(
                    "Please enter an announcement title.",
                    "error"
                );

                titleInput.focus();

                return;
            }


            if (!category) {

                showMessage(
                    "Please select a category.",
                    "error"
                );

                categoryInput.focus();

                return;
            }


            if (!message) {

                showMessage(
                    "Please enter the announcement message.",
                    "error"
                );

                messageInput.focus();

                return;
            }


            // ========================================
            // BUTTON
            // ========================================

            if (updateButton) {

                updateButton.disabled =
                    true;

                const buttonText =
                    updateButton.querySelector(
                        ".button-text"
                    );

                if (buttonText) {

                    buttonText.textContent =
                        "Updating...";

                }

            }


            try {

                const {
                    data,
                    error
                } =
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
                        )
                        .select()
                        .maybeSingle();


                if (error) {

                    console.error(
                        "Update announcement error:",
                        error
                    );

                    showMessage(
                        "Unable to update announcement: " +
                        error.message,
                        "error"
                    );

                    return;
                }


                if (!data) {

                    showMessage(
                        "The announcement was not updated. Please check your permissions.",
                        "error"
                    );

                    return;
                }


                console.log(
                    "Announcement updated successfully:",
                    data
                );


                showMessage(
                    "Announcement updated successfully!",
                    "success"
                );


                setTimeout(
                    function () {

                        window.location.href =
                            "teacher-announcements.html";

                    },
                    1000
                );


            } catch (error) {

                console.error(
                    "Unexpected update error:",
                    error
                );

                showMessage(
                    "Something went wrong while updating the announcement.",
                    "error"
                );

            } finally {

                if (updateButton) {

                    updateButton.disabled =
                        false;


                    const buttonText =
                        updateButton.querySelector(
                            ".button-text"
                        );


                    if (buttonText) {

                        buttonText.textContent =
                            "Update Announcement";

                    }

                }

            }

        }
    );

}


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await loadAnnouncement();

    }
);