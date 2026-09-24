// ==========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER PROFILE & ACCOUNT MANAGEMENT
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
// LOAD TEACHER PROFILE
// ==========================================

async function loadTeacherProfile() {

    try {

        const {
            data: { user },
            error: authError
        } = await supabaseClient.auth.getUser();


        if (authError || !user) {

            window.location.href =
                "teacher-login.html";

            return;
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
                email,
                role,
                created_at
            `)
            .eq("auth_id", user.id)
            .maybeSingle();


        if (teacherError) {

            console.error(
                "Teacher profile error:",
                teacherError
            );

            alert(
                "Unable to load your teacher profile."
            );

            return;
        }


        if (!teacher) {

            alert(
                "Teacher account not found."
            );

            await supabaseClient.auth.signOut();

            window.location.href =
                "teacher-login.html";

            return;
        }


        displayTeacherProfile(
            teacher,
            user
        );

    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        alert(
            "Something went wrong while loading your profile."
        );

    }
}


// ==========================================
// DISPLAY PROFILE
// ==========================================

function displayTeacherProfile(
    teacher,
    user
) {

    const fullName =
        teacher.full_name || "Teacher";


    const email =
        teacher.email ||
        user.email ||
        "—";


    const role =
        formatRole(teacher.role);


    document.getElementById(
        "teacherName"
    ).textContent =
        fullName;


    document.getElementById(
        "teacherFullName"
    ).textContent =
        fullName;


    document.getElementById(
        "teacherEmail"
    ).textContent =
        email;


    document.getElementById(
        "teacherId"
    ).textContent =
        teacher.id || "—";


    document.getElementById(
        "teacherRole"
    ).textContent =
        role;


    document.getElementById(
        "teacherRoleCard"
    ).textContent =
        role;


    // DATE CREATED

    if (teacher.created_at) {

        const date =
            new Date(
                teacher.created_at
            ).toLocaleDateString(
                "en-GB",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );


        document.getElementById(
            "teacherCreatedAt"
        ).textContent =
            date;

    } else {

        document.getElementById(
            "teacherCreatedAt"
        ).textContent =
            "—";
    }


    // INITIAL

    const initial =
        fullName
            .trim()
            .charAt(0)
            .toUpperCase();


    document.getElementById(
        "teacherInitial"
    ).textContent =
        initial;


    // FILL EDIT FORM

    document.getElementById(
        "editFullName"
    ).value =
        fullName;


    document.getElementById(
        "editEmail"
    ).value =
        email;
}


// ==========================================
// FORMAT ROLE
// ==========================================

function formatRole(role) {

    if (!role) {
        return "Teacher";
    }


    return role
        .charAt(0)
        .toUpperCase() +
        role.slice(1);
}


// ==========================================
// EDIT PROFILE
// ==========================================

const editProfileButton =
    document.getElementById(
        "editProfileButton"
    );


const editProfileForm =
    document.getElementById(
        "editProfileForm"
    );


const cancelEditButton =
    document.getElementById(
        "cancelEditButton"
    );


if (editProfileButton) {

    editProfileButton.addEventListener(
        "click",
        function () {

            editProfileForm.style.display =
                "block";

            editProfileButton.style.display =
                "none";

        }
    );

}


// ==========================================
// CANCEL EDIT
// ==========================================

if (cancelEditButton) {

    cancelEditButton.addEventListener(
        "click",
        function () {

            editProfileForm.style.display =
                "none";

            editProfileButton.style.display =
                "inline-block";

        }
    );

}


// ==========================================
// SAVE PROFILE
// ==========================================

const saveProfileButton =
    document.getElementById(
        "saveProfileButton"
    );


if (saveProfileButton) {

    saveProfileButton.addEventListener(
        "click",
        async function () {

            const fullName =
                document.getElementById(
                    "editFullName"
                ).value.trim();


            const email =
                document.getElementById(
                    "editEmail"
                ).value.trim();


            if (!fullName) {

                alert(
                    "Please enter your full name."
                );

                return;
            }


            if (!email) {

                alert(
                    "Please enter your email address."
                );

                return;
            }


            saveProfileButton.disabled =
                true;


            saveProfileButton.textContent =
                "Saving...";


            try {

                // GET CURRENT USER

                const {
                    data: { user },
                    error: userError
                } =
                    await supabaseClient.auth.getUser();


                if (userError || !user) {

                    throw new Error(
                        "Your session has expired. Please log in again."
                    );
                }


                // UPDATE TEACHERS TABLE

                const {
                    error: teacherError
                } =
                    await supabaseClient
                        .from("Teachers")
                        .update({
                            full_name:
                                fullName,
                            email:
                                email
                        })
                        .eq(
                            "auth_id",
                            user.id
                        );


                if (teacherError) {
                    throw teacherError;
                }


                // UPDATE AUTH EMAIL IF CHANGED

                if (
                    email !==
                    user.email
                ) {

                    const {
                        error: authUpdateError
                    } =
                        await supabaseClient.auth.updateUser({
                            email: email
                        });


                    if (authUpdateError) {
                        throw authUpdateError;
                    }

                }


                alert(
                    "Profile updated successfully!"
                );


                // RELOAD PROFILE

                await loadTeacherProfile();


                editProfileForm.style.display =
                    "none";

                editProfileButton.style.display =
                    "inline-block";


            } catch (error) {

                console.error(
                    "Profile update error:",
                    error
                );


                alert(
                    "Unable to update profile:\n\n" +
                    error.message
                );

            } finally {

                saveProfileButton.disabled =
                    false;

                saveProfileButton.textContent =
                    "💾 Save Changes";
            }

        }
    );

}


// ==========================================
// CHANGE PASSWORD
// ==========================================

const changePasswordButton =
    document.getElementById(
        "changePasswordButton"
    );


if (changePasswordButton) {

    changePasswordButton.addEventListener(
        "click",
        async function () {

            const newPassword =
                prompt(
                    "Enter your new password:\n\nMinimum 6 characters."
                );


            if (newPassword === null) {
                return;
            }


            if (newPassword.length < 6) {

                alert(
                    "Password must be at least 6 characters long."
                );

                return;
            }


            const confirmPassword =
                prompt(
                    "Confirm your new password:"
                );


            if (confirmPassword === null) {
                return;
            }


            if (
                newPassword !==
                confirmPassword
            ) {

                alert(
                    "Passwords do not match."
                );

                return;
            }


            changePasswordButton.disabled =
                true;


            changePasswordButton.textContent =
                "Updating Password...";


            try {

                const {
                    error
                } =
                    await supabaseClient.auth.updateUser({
                        password:
                            newPassword
                    });


                if (error) {
                    throw error;
                }


                alert(
                    "Password changed successfully!"
                );


            } catch (error) {

                console.error(
                    "Password update error:",
                    error
                );


                alert(
                    "Unable to change password:\n\n" +
                    error.message
                );


            } finally {

                changePasswordButton.disabled =
                    false;


                changePasswordButton.textContent =
                    "🔐 Change Password";
            }

        }
    );

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

            const confirmed =
                confirm(
                    "Are you sure you want to log out?"
                );


            if (!confirmed) {
                return;
            }


            logoutButton.disabled =
                true;


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


                logoutButton.disabled =
                    false;


                logoutButton.textContent =
                    "Log Out";
            }

        }
    );

}


// ==========================================
// START
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadTeacherProfile();

    }
);