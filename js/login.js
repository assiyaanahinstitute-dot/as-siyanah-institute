document.addEventListener("DOMContentLoaded", function () {


    /* =========================================
       LOGIN FORM
    ========================================== */

    const loginForm =
        document.getElementById("loginForm");


    if (!loginForm) {
        return;
    }


    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            const button =
                loginForm.querySelector(
                    "button[type='submit']"
                );


            if (!email || !password) {

                alert(
                    "Please enter your email address and password."
                );

                return;
            }


            button.textContent =
                "Logging in...";

            button.disabled = true;


            try {


                /* =========================================
                   SIGN IN WITH SUPABASE AUTH
                ========================================== */

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .auth
                        .signInWithPassword({

                            email: email,

                            password: password

                        });


                if (error) {

                    console.error(
                        "Login error:",
                        error
                    );


                    alert(
                        "Login failed.\n\n" +
                        error.message
                    );

                    return;
                }


                console.log(
                    "Login successful:",
                    data.user
                );


                /* =========================================
                   STUDENT DASHBOARD
                ========================================== */

                window.location.href =
                    "dashboard.html";


            } catch (error) {

                console.error(
                    "Unexpected login error:",
                    error
                );


                alert(
                    "Something went wrong.\n\n" +
                    error.message
                );


            } finally {

                button.textContent =
                    "Login";

                button.disabled =
                    false;

            }

        }
    );



    /* =========================================
       FORGOT PASSWORD
    ========================================== */

    const forgotPasswordLink =
        document.getElementById(
            "forgotPasswordLink"
        );


    if (forgotPasswordLink) {

        forgotPasswordLink.addEventListener(
            "click",
            async function () {


                const email =
                    document
                        .getElementById("email")
                        .value
                        .trim();


                /* =========================================
                   CHECK EMAIL
                ========================================== */

                if (!email) {

                    alert(
                        "Please enter your email address first."
                    );


                    document
                        .getElementById("email")
                        .focus();


                    return;
                }


                /* =========================================
                   SEND PASSWORD RESET EMAIL
                ========================================== */

                forgotPasswordLink.disabled =
                    true;


                forgotPasswordLink.textContent =
                    "Sending...";


                try {


                    const {
                        error
                    } =
                        await supabaseClient
                            .auth
                            .resetPasswordForEmail(
                                email,
                                {

                                    redirectTo:
                                        window.location.origin +
                                        "/reset-password.html"

                                }
                            );


                    if (error) {

                        console.error(
                            "Password reset error:",
                            error
                        );


                        alert(
                            "Unable to send password reset link.\n\n" +
                            error.message
                        );


                        return;
                    }


                    alert(
                        "Password reset link sent!\n\n" +
                        "Please check your email."
                    );


                } catch (error) {

                    console.error(
                        "Unexpected password reset error:",
                        error
                    );


                    alert(
                        "Something went wrong.\n\n" +
                        error.message
                    );


                } finally {

                    forgotPasswordLink.disabled =
                        false;


                    forgotPasswordLink.textContent =
                        "Forgot password?";

                }

            }
        );

    }

});