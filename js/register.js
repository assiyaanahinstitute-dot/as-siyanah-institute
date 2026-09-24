// ========================================
// AS-SIYĀNAH INSTITUTE
// STUDENT REGISTRATION
// ========================================

const SUPABASE_URL =
    "https://ridyfpaqoyegdvqmkiyl.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_dH1z6RuBIqxN88pyG9YfVA_1niXEWIh";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ========================================
// FORM
// ========================================

const registrationForm =
    document.getElementById("registrationForm");


registrationForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const submitButton =
        registrationForm.querySelector(
            'button[type="submit"]'
        );

    submitButton.disabled = true;

    submitButton.innerHTML = `
        <span>Creating your account...</span>
    `;


    // ========================================
    // GET PASSWORD
    // ========================================

    const password =
        document.getElementById("password").value;


    // ========================================
    // GET FORM VALUES
    // ========================================

    const studentData = {

        full_name:
            document.getElementById("fullName").value.trim(),

        gender:
            document.getElementById("gender").value,

        date_of_birth:
            document.getElementById("dateOfBirth").value || null,

        country:
            document.getElementById("country").value.trim(),

        city:
            document.getElementById("city").value.trim(),

        whatsapp:
            document.getElementById("whatsapp").value.trim(),

        email:
            document.getElementById("email").value.trim(),

        programme:
            document.querySelector(
                'input[name="programme"]:checked'
            )?.value || "",

        level:
            document.getElementById("level").value,

        education:
            document.getElementById("education").value.trim(),

        class_time:
            document.querySelector(
                'input[name="classTime"]:checked'
            )?.value || "",

        device:
            document.querySelector(
                'input[name="device"]:checked'
            )?.value || "",

        source:
            document.getElementById("source").value,

        message:
            document.getElementById("message").value.trim()
    };


    // ========================================
    // CREATE SUPABASE AUTH ACCOUNT
    // ========================================

    const {
        data: authData,
        error: authError
    } = await supabaseClient.auth.signUp({

        email: studentData.email,

        password: password,

        options: {
            data: {
                full_name: studentData.full_name,
                role: "student"
            }
        }

    });


    // ========================================
    // AUTH ERROR
    // ========================================

    if (authError) {

        console.error(
            "Authentication error:",
            authError
        );

        alert(
            "Account creation failed.\n\n" +
            authError.message
        );

        submitButton.disabled = false;

        submitButton.innerHTML = `
            <span>Complete Registration</span>
            <strong>→</strong>
        `;

        return;
    }


    // ========================================
    // GET AUTH USER ID
    // ========================================

    const authUser = authData.user;


    if (!authUser) {

        alert(
            "Account creation could not be completed. Please try again."
        );

        submitButton.disabled = false;

        submitButton.innerHTML = `
            <span>Complete Registration</span>
            <strong>→</strong>
        `;

        return;
    }


    // ========================================
    // ADD AUTH ID TO STUDENT RECORD
    // ========================================

    studentData.auth_id = authUser.id;


    // ========================================
    // INSERT INTO STUDENT TABLE
    // ========================================

    submitButton.innerHTML = `
        <span>Completing registration...</span>
    `;


    const {
        data,
        error
    } = await supabaseClient
        .from("Student")
        .insert([studentData]);


    // ========================================
    // STUDENT TABLE ERROR
    // ========================================

    if (error) {

        console.error(
            "Student registration error:",
            error
        );

        alert(
            "Your account was created, but your student registration could not be completed.\n\n" +
            error.message
        );

        submitButton.disabled = false;

        submitButton.innerHTML = `
            <span>Complete Registration</span>
            <strong>→</strong>
        `;

        return;
    }


    // ========================================
    // SUCCESS
    // ========================================

    console.log(
        "Student registration successful:",
        data
    );


    alert(
        "Registration successful!\n\n" +
        "Your student account has been created successfully."
    );


    registrationForm.reset();


    submitButton.disabled = false;

    submitButton.innerHTML = `
        <span>Complete Registration</span>
        <strong>→</strong>
    `;


    // ========================================
    // GO TO LOGIN
    // ========================================

    window.location.href = "login.html";

});