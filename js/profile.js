document.addEventListener("DOMContentLoaded", async function () {

    const profileName =
        document.getElementById("profileName");

    const profileStudentId =
        document.getElementById("profileStudentId");

    const profileGender =
        document.getElementById("profileGender");

    const profileDob =
        document.getElementById("profileDob");

    const profileCountry =
        document.getElementById("profileCountry");

    const profileCity =
        document.getElementById("profileCity");

    const profileWhatsapp =
        document.getElementById("profileWhatsapp");

    const profileEmail =
        document.getElementById("profileEmail");

    const profileProgramme =
        document.getElementById("profileProgramme");

    const profileLevel =
        document.getElementById("profileLevel");

    const profileEducation =
        document.getElementById("profileEducation");

    const profileClassTime =
        document.getElementById("profileClassTime");

    const profileDevice =
        document.getElementById("profileDevice");

    const profileSource =
        document.getElementById("profileSource");


    try {

        // ==========================================
        // CHECK LOGIN
        // ==========================================

        const {
            data: { user },
            error: authError
        } = await supabaseClient.auth.getUser();


        if (authError || !user) {

            window.location.href = "login.html";

            return;
        }


        // ==========================================
        // LOAD STUDENT PROFILE
        // USE EMAIL
        // ==========================================

        const {
            data: student,
            error: studentError
        } = await supabaseClient
            .from("Student")
            .select(`
                full_name,
                student_id,
                gender,
                date_of_birth,
                country,
                city,
                whatsapp,
                email,
                programme,
                level,
                education,
                class_time,
                device,
                source
            `)
            .eq("email", user.email)
            .maybeSingle();


        // ==========================================
        // CHECK FOR DATABASE ERROR
        // ==========================================

        if (studentError) {

            console.error(
                "Profile loading error:",
                studentError
            );

            if (profileName) {
                profileName.textContent =
                    "Unable to load";
            }

            return;
        }


        // ==========================================
        // CHECK STUDENT RECORD
        // ==========================================

        if (!student) {

            console.error(
                "No student record found for:",
                user.email
            );

            if (profileName) {
                profileName.textContent =
                    "Student not found";
            }

            return;
        }


        // ==========================================
        // DISPLAY PERSONAL INFORMATION
        // ==========================================

        if (profileName) {

            profileName.textContent =
                student.full_name || "—";

        }


        if (profileGender) {

            profileGender.textContent =
                student.gender || "—";

        }


        // ==========================================
        // DISPLAY DATE OF BIRTH
        // ==========================================

        if (profileDob) {

            if (student.date_of_birth) {

                const date = new Date(
                    student.date_of_birth + "T00:00:00"
                );


                if (!isNaN(date.getTime())) {

                    profileDob.textContent =
                        date.toLocaleDateString(
                            "en-GB",
                            {
                                day: "2-digit",
                                month: "long",
                                year: "numeric"
                            }
                        );

                } else {

                    profileDob.textContent =
                        student.date_of_birth;

                }

            } else {

                profileDob.textContent =
                    "—";

            }

        }


        if (profileCountry) {

            profileCountry.textContent =
                student.country || "—";

        }


        if (profileCity) {

            profileCity.textContent =
                student.city || "—";

        }


        // ==========================================
        // CONTACT INFORMATION
        // ==========================================

        if (profileWhatsapp) {

            profileWhatsapp.textContent =
                student.whatsapp || "—";

        }


        if (profileEmail) {

            profileEmail.textContent =
                student.email ||
                user.email ||
                "—";

        }


        // ==========================================
        // ACADEMIC INFORMATION
        // ==========================================

        if (profileStudentId) {

            profileStudentId.textContent =
                student.student_id || "—";

        }


        if (profileProgramme) {

            profileProgramme.textContent =
                student.programme || "—";

        }


        if (profileLevel) {

            profileLevel.textContent =
                student.level || "—";

        }


        if (profileClassTime) {

            profileClassTime.textContent =
                student.class_time || "—";

        }


        if (profileDevice) {

            profileDevice.textContent =
                student.device || "—";

        }


        // ==========================================
        // ADDITIONAL INFORMATION
        // ==========================================

        if (profileEducation) {

            profileEducation.textContent =
                student.education || "—";

        }


        if (profileSource) {

            profileSource.textContent =
                student.source || "—";

        }


    } catch (error) {

        console.error(
            "Unexpected profile error:",
            error
        );


        if (profileName) {

            profileName.textContent =
                "Unable to load";

        }

    }


    // ==========================================
    // LOGOUT
    // ==========================================

    const logoutButton =
        document.getElementById("logoutButton");


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