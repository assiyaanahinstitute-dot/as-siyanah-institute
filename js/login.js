document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        return;
    }

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const studentId =
            document.getElementById("studentId")
                .value
                .trim()
                .toUpperCase();

        const password =
            document.getElementById("password").value;

        const button =
            loginForm.querySelector(
                "button[type='submit']"
            );

        if (!studentId || !password) {

            alert(
                "Please enter your Student ID and password."
            );

            return;
        }

        button.textContent = "Logging in...";
        button.disabled = true;

        try {

            // Find student using Student ID
            const { data: student, error: studentError } =
                await supabaseClient
                    .from("Student")
                    .select("student_id, email, full_name")
                    .eq("student_id", studentId)
                    .maybeSingle();

            if (studentError) {

                alert(
                    "Unable to find student account.\n\n" +
                    studentError.message
                );

                return;
            }

            if (!student) {

                alert(
                    "Student ID could not be found.\n\n" +
                    "Please check your Student ID."
                );

                return;
            }

            console.log(
                "Student found:",
                student
            );

            // Sign in with Supabase Auth
            const { data, error } =
                await supabaseClient.auth
                    .signInWithPassword({

                        email: student.email,
                        password: password

                    });

            if (error) {

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

            // Go to student dashboard
            window.location.href =
                "dashboard.html";

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            alert(
                "Something went wrong.\n\n" +
                error.message
            );

        } finally {

            button.textContent = "Login";
            button.disabled = false;

        }

    });

});