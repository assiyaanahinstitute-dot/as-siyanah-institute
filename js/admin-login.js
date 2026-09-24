// ========================================
// AS-SIYĀNAH INSTITUTE
// ADMIN LOGIN
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
// ADMIN LOGIN
// ========================================

document
    .getElementById("adminLoginForm")
    .addEventListener("submit", async function (e) {

        e.preventDefault();

        const email =
            document.getElementById("adminEmail").value.trim();

        const password =
            document.getElementById("adminPassword").value;

        const message =
            document.getElementById("adminLoginMessage");

        const button =
            document.getElementById("adminLoginButton");

        message.textContent = "";
        button.disabled = true;
        button.textContent = "Signing in...";


        // Sign in
        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });


        if (error) {
            message.textContent =
                "Invalid email or password.";

            button.disabled = false;
            button.textContent = "Login";

            return;
        }


        // Get logged-in user
        const user = data.user;


        // Check if user is an admin
        const { data: admin, error: adminError } =
            await supabaseClient
                .from("Admin")
                .select("id, full_name, email, role")
                .eq("auth_id", user.id)
                .eq("role", "admin")
                .maybeSingle();


        if (adminError || !admin) {

            await supabaseClient.auth.signOut();

            message.textContent =
                "You are not authorized as an admin.";

            button.disabled = false;
            button.textContent = "Login";

            return;
        }


        // Admin verified
        window.location.href =
            "admin-dashboard.html";

    });