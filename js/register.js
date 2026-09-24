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
        <span>Registering...</span>
    `;


    // ========================================
    // GET VALUES
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


    console.log("Student data:", studentData);


    // ========================================
    // INSERT INTO STUDENT TABLE
    // ========================================

    const { data, error } =
        await supabaseClient
            .from("Student")
            .insert([studentData])
            


    // ========================================
    // ERROR
    // ========================================

    if (error) {

        console.error(
            "Registration error:",
            error
        );

        alert(
            "Registration failed.\n\n" +
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
        "Registration successful:",
        data
    );

    alert(
        "Registration successful! Welcome to As-Siyānah Institute."
    );

    registrationForm.reset();

    submitButton.disabled = false;

    submitButton.innerHTML = `
        <span>Complete Registration</span>
        <strong>→</strong>
    `;

});