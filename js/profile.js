document.addEventListener("DOMContentLoaded", async function () {

    const profileName =
        document.getElementById("profileName");

    const profileStudentId =
        document.getElementById("profileStudentId");

    const profileGender =
        document.getElementById("profileGender");

    const profileDateOfBirth =
        document.getElementById("profileDateOfBirth");

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

        // ================================
        // CHECK LOGIN
        // ================================

        const {
            data: { user },
            error: authError
        } = await supabaseClient.auth.getUser();


        if (authError || !user) {

            window.location.href =
                "login.html";

            return;
        }


        // ================================
        // LOAD STUDENT PROFILE
        // ================================

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
            .eq("auth_id", user.id)
            .maybeSingle();


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


        if (!student) {

            if (profileName) {
                profileName.textContent =
                    "Student not found";
            }

            return;
        }


        // ================================
        // DISPLAY STUDENT INFORMATION
        // ================================

        if (profileName) {
            profileName.textContent =
                student.full_name || "—";
        }


        if (profileStudentId) {
            profileStudentId.textContent =
                student.student_id || "—";
        }


        if (profileGender) {
            profileGender.textContent =
                student.gender || "—";
        }


        if (profileDateOfBirth) {
            profileDateOfBirth.textContent =
                student.date_of_birth || "—";
        }


        if (profileCountry) {
            profileCountry.textContent =
                student.country || "—";
        }


        if (profileCity) {
            profileCity.textContent =
                student.city || "—";
        }


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


        if (profileProgramme) {
            profileProgramme.textContent =
                student.programme || "—";
        }


        if (profileLevel) {
            profileLevel.textContent =
                student.level || "—";
        }


        if (profileEducation) {
            profileEducation.textContent =
                student.education || "—";
        }


        if (profileClassTime) {
            profileClassTime.textContent =
                student.class_time || "—";
        }


        if (profileDevice) {
            profileDevice.textContent =
                student.device || "—";
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

});