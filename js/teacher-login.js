// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER LOGIN
// ========================================

// Supabase connection
const SUPABASE_URL = "https://ridyfpaqoyegdvqmkiyl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_dH1z6RuBIqxN88pyG9YfVA_1niXEWIh";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ========================================
// TEACHER LOGIN FORM
// ========================================

const teacherLoginForm = document.getElementById("teacherLoginForm");

teacherLoginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email = document.getElementById("teacherEmail").value.trim();
    const password = document.getElementById("teacherPassword").value;

    if (!email || !password) {
        alert("Please enter your email and password.");
        return;
    }

    // Disable button while logging in
    const loginButton = teacherLoginForm.querySelector("button");
    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";

    try {

        // Sign in using Supabase Authentication
        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            throw error;
        }

        if (!data.user) {
            throw new Error("Teacher account could not be found.");
        }

        // Successful login
        alert("Login successful!");

        // Go to teacher dashboard
        window.location.href = "teacher-dashboard.html";

    } catch (error) {

        console.error("Teacher login error:", error);

        alert(
            error.message ||
            "Login failed. Please check your email and password."
        );

        loginButton.disabled = false;
        loginButton.textContent = "Login to Teacher Portal";
    }

});
