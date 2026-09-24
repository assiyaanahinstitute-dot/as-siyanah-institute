document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const message =
            document.getElementById(
                "registrationMessage"
            );

        const details =
            document.getElementById(
                "registrationDetails"
            );

        const statusSelect =
            document.getElementById(
                "registrationStatus"
            );

        const saveStatusButton =
            document.getElementById(
                "saveRegistrationStatus"
            );

        const convertButton =
            document.getElementById(
                "convertToStudentButton"
            );


        // ========================================
        // CHECK ADMIN LOGIN
        // ========================================

        const {
            data: sessionData
        } =
            await supabaseClient.auth.getSession();


        if (!sessionData.session) {

            window.location.href =
                "admin-login.html";

            return;
        }


        // ========================================
        // GET REGISTRATION ID
        // ========================================

        const params =
            new URLSearchParams(
                window.location.search
            );

        const registrationId =
            params.get("id");


        if (!registrationId) {

            message.textContent =
                "Registration ID was not provided.";

            return;
        }


        // ========================================
        // LOAD REGISTRATION
        // ========================================

        const {
            data: registration,
            error
        } =
            await supabaseClient
                .from("Student")
                .select(`
                    id,
                    full_name,
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
                    source,
                    message,
                    registration_status,
                    auth_id,
                    student_id
                `)
                .eq(
                    "id",
                    registrationId
                )
                .single();


        if (error) {

            console.error(
                "Registration loading error:",
                error
            );

            message.textContent =
                "Unable to load registration: " +
                error.message;

            return;
        }


        if (!registration) {

            message.textContent =
                "Registration not found.";

            return;
        }


        // ========================================
        // DISPLAY REGISTRATION DETAILS
        // ========================================

        document.getElementById(
            "registrationId"
        ).textContent =
            registration.id || "N/A";


        document.getElementById(
            "registrationName"
        ).textContent =
            registration.full_name || "N/A";


        document.getElementById(
            "registrationGender"
        ).textContent =
            registration.gender || "N/A";


        document.getElementById(
            "registrationDateOfBirth"
        ).textContent =
            registration.date_of_birth || "N/A";


        document.getElementById(
            "registrationCountry"
        ).textContent =
            registration.country || "N/A";


        document.getElementById(
            "registrationCity"
        ).textContent =
            registration.city || "N/A";


        document.getElementById(
            "registrationWhatsApp"
        ).textContent =
            registration.whatsapp || "N/A";


        document.getElementById(
            "registrationEmail"
        ).textContent =
            registration.email || "N/A";


        document.getElementById(
            "registrationProgramme"
        ).textContent =
            registration.programme || "N/A";


        document.getElementById(
            "registrationLevel"
        ).textContent =
            registration.level || "N/A";


        document.getElementById(
            "registrationEducation"
        ).textContent =
            registration.education || "N/A";


        document.getElementById(
            "registrationClassTime"
        ).textContent =
            registration.class_time || "N/A";


        document.getElementById(
            "registrationDevice"
        ).textContent =
            registration.device || "N/A";


        document.getElementById(
            "registrationSource"
        ).textContent =
            registration.source || "N/A";


        document.getElementById(
            "registrationFullMessage"
        ).textContent =
            registration.message || "N/A";


        // ========================================
        // REGISTRATION STATUS
        // ========================================

        statusSelect.value =
            registration.registration_status ||
            "Pending";


        // ========================================
        // ALREADY CONVERTED?
        // ========================================

        if (
            registration.auth_id &&
            registration.student_id
        ) {

            convertButton.textContent =
                "Already a Student";

            convertButton.disabled =
                true;

        }


        // ========================================
        // SHOW DETAILS
        // ========================================

        message.style.display =
            "none";

        details.style.display =
            "block";


        // ========================================
        // SAVE REGISTRATION STATUS
        // ========================================

        saveStatusButton.addEventListener(
            "click",
            async function () {

                const newStatus =
                    statusSelect.value;


                saveStatusButton.disabled =
                    true;

                saveStatusButton.textContent =
                    "Saving...";


                const {
                    error: updateError
                } =
                    await supabaseClient
                        .from("Student")
                        .update({
                            registration_status:
                                newStatus
                        })
                        .eq(
                            "id",
                            registrationId
                        );


                if (updateError) {

                    console.error(
                        "Status update error:",
                        updateError
                    );

                    alert(
                        "Unable to save status: " +
                        updateError.message
                    );

                    saveStatusButton.disabled =
                        false;

                    saveStatusButton.textContent =
                        "Save Status";

                    return;
                }


                alert(
                    "Registration status updated successfully."
                );


                saveStatusButton.disabled =
                    false;

                saveStatusButton.textContent =
                    "Save Status";


            }
        );


        // ========================================
        // CONVERT TO STUDENT
        // ========================================

        convertButton.addEventListener(
            "click",
            async function () {

                // Registration must be approved
                if (
                    statusSelect.value !==
                    "Approved"
                ) {

                    alert(
                        "Please approve this registration before converting it to a student."
                    );

                    return;
                }


                // Email required
                if (
                    !registration.email
                ) {

                    alert(
                        "This registration does not have an email address."
                    );

                    return;
                }


                // Ask for password
                const password =
                    prompt(
                        "Create a password for this student's portal account:"
                    );


                if (!password) {

                    return;
                }


                if (
                    password.length < 6
                ) {

                    alert(
                        "Password must be at least 6 characters."
                    );

                    return;
                }


                const confirmed =
                    confirm(
                        "Convert " +
                        registration.full_name +
                        " into a student account?"
                    );


                if (!confirmed) {

                    return;
                }


                convertButton.disabled =
                    true;

                convertButton.textContent =
                    "Creating Student...";


                try {

                    const {
                        data,
                        error:
                            functionError
                    } =
                        await supabaseClient.functions.invoke(
                            "rapid-api",
                            {
                                body: {
                                    registration_id:
                                        registrationId,

                                    password:
                                        password
                                }
                            }
                        );


                   if (functionError) {

    console.error(
        "Create student function error:",
        functionError
    );

    let actualError =
        functionError.message;

    // Try to read the actual Edge Function response
    if (functionError.context) {

        try {

            const responseData =
                await functionError.context.json();

            console.error(
                "Edge Function response:",
                responseData
            );

            actualError =
                responseData.details ||
                responseData.error ||
                actualError;

        } catch (parseError) {

            console.error(
                "Could not read Edge Function response:",
                parseError
            );
        }
    }

    alert(
        "Unable to create student account:\n\n" +
        actualError
    );

    convertButton.disabled =
        false;

    convertButton.textContent =
        "Convert to Student";

    return;
}


                    if (
                        !data ||
                        !data.success
                    ) {

                        alert(
                            data?.error ||
                            "Unable to create student account."
                        );

                        convertButton.disabled =
                            false;

                        convertButton.textContent =
                            "Convert to Student";

                        return;
                    }


                    alert(
                        "Student account created successfully!\n\n" +
                        "Student ID: " +
                        data.student_id
                    );


                    convertButton.textContent =
                        "Already a Student";

                    // Reload the page
                    // so the new student ID/auth ID appear
                    setTimeout(
                        function () {

                            window.location.reload();

                        },
                        500
                    );


                } catch (error) {

                    console.error(
                        "Unexpected conversion error:",
                        error
                    );

                    alert(
                        "An unexpected error occurred: " +
                        error.message
                    );

                    convertButton.disabled =
                        false;

                    convertButton.textContent =
                        "Convert to Student";

                }

            }
        );

    }
);