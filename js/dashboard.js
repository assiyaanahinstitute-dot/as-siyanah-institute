document.addEventListener("DOMContentLoaded", async function () {

    const studentName =
        document.getElementById("studentName");

    const studentId =
        document.getElementById("studentId");

    const studentProgramme =
        document.getElementById("studentProgramme");

    const studentLevel =
        document.getElementById("studentLevel");

    const studentClassTime =
        document.getElementById("studentClassTime");

    const logoutButton =
        document.getElementById("studentLogoutButton");


    try {

        // ========================================
        // GET LOGGED-IN USER
        // ========================================

        const {
            data: { user },
            error: authError
        } =
            await supabaseClient.auth.getUser();


        if (authError || !user) {

            window.location.href = "login.html";

            return;
        }


        console.log(
            "Logged-in user:",
            user.email
        );


        // ========================================
        // FIND STUDENT
        // ========================================

        const {
            data: student,
            error: studentError
        } =
            await supabaseClient
                .from("Student")
                .select(
                    "id, full_name, student_id, programme, level, class_time, email, auth_id"
                )
                .eq("email", user.email)
                .maybeSingle();


        if (studentError) {

            console.error(
                "Student lookup error:",
                studentError
            );

            if (studentName) {
                studentName.textContent =
                    "Unable to load";
            }

            return;
        }


        if (!student) {

            console.error(
                "No student found for:",
                user.email
            );

            if (studentName) {
                studentName.textContent =
                    "Student not found";
            }

            return;
        }


        console.log(
            "Student found:",
            student
        );


        // ========================================
        // DISPLAY STUDENT INFORMATION
        // ========================================

        if (studentName) {

            studentName.textContent =
                student.full_name || "Student";
        }


        if (studentId) {

            studentId.textContent =
                student.student_id || "Not provided";
        }


        if (studentProgramme) {

            studentProgramme.textContent =
                student.programme || "Not provided";
        }


        if (studentLevel) {

            studentLevel.textContent =
                student.level || "Not provided";
        }


        if (studentClassTime) {

            studentClassTime.textContent =
                student.class_time || "Not provided";
        }


    } catch (error) {

        console.error(
            "Dashboard error:",
            error
        );

        if (studentName) {

            studentName.textContent =
                "Unable to load";
        }

    }


    // ========================================
    // LOGOUT
    // ========================================

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async function () {

                await supabaseClient.auth.signOut();

                window.location.href =
                    "login.html";

            }
        );

    }

});