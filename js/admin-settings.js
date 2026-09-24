// ========================================
// AS-SIYĀNAH INSTITUTE
// ADMIN SETTINGS
// ========================================

// SUPABASE CONNECTION

const SUPABASE_URL =
    "https://ridyfpaqoyegdvqmkiyl.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_dH1z6RuBIqxN88pyG9YfVA_1niXEWIh";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ========================================
// ELEMENTS
// ========================================

const instituteName =
    document.getElementById("instituteName");

const instituteEmail =
    document.getElementById("instituteEmail");

const institutePhone =
    document.getElementById("institutePhone");

const instituteCountry =
    document.getElementById("instituteCountry");

const instituteAddress =
    document.getElementById("instituteAddress");

const academicSession =
    document.getElementById("academicSession");

const currentTerm =
    document.getElementById("currentTerm");

const saveSettingsButton =
    document.getElementById("saveSettingsButton");

const settingsMessage =
    document.getElementById("settingsMessage");


// ========================================
// SHOW MESSAGE
// ========================================

function showMessage(message, type) {

    settingsMessage.textContent = message;

    settingsMessage.className =
        "settings-message " + type;

}


// ========================================
// CHECK ADMIN
// ========================================

async function checkAdmin() {

    const {
        data: {
            user
        },
        error: userError
    } = await supabaseClient.auth.getUser();


    if (userError || !user) {

        window.location.href =
            "admin-login.html";

        return false;
    }


    const {
        data: admin,
        error: adminError
    } = await supabaseClient
        .from("Admin")
        .select("role")
        .eq("auth_id", user.id)
        .single();


    if (
        adminError ||
        !admin ||
        admin.role !== "admin"
    ) {

        await supabaseClient.auth.signOut();

        window.location.href =
            "admin-login.html";

        return false;
    }


    return true;
}


// ========================================
// LOAD SETTINGS
// ========================================

async function loadSettings() {

    const {
        data,
        error
    } = await supabaseClient
        .from("Settings")
        .select("*")
        .order("id", {
            ascending: true
        })
        .limit(1)
        .single();


    if (error) {

        console.error(
            "Unable to load settings:",
            error
        );

        showMessage(
            "Unable to load settings.",
            "error"
        );

        return;
    }


    instituteName.value =
        data.institute_name || "";

    instituteEmail.value =
        data.institute_email || "";

    institutePhone.value =
        data.institute_phone || "";

    instituteCountry.value =
        data.institute_country || "";

    instituteAddress.value =
        data.institute_address || "";

    academicSession.value =
        data.academic_session || "";

    currentTerm.value =
        data.current_term || "";
}


// ========================================
// SAVE SETTINGS
// ========================================

async function saveSettings() {

    saveSettingsButton.disabled = true;

    saveSettingsButton.textContent =
        "Saving...";


    const {
        data: existingSettings,
        error: findError
    } = await supabaseClient
        .from("Settings")
        .select("id")
        .order("id", {
            ascending: true
        })
        .limit(1)
        .single();


    if (findError || !existingSettings) {

        showMessage(
            "Settings record could not be found.",
            "error"
        );

        saveSettingsButton.disabled = false;

        saveSettingsButton.textContent =
            "Save Settings";

        return;
    }


    const {
        error
    } = await supabaseClient
        .from("Settings")
        .update({

            institute_name:
                instituteName.value.trim(),

            institute_email:
                instituteEmail.value.trim(),

            institute_phone:
                institutePhone.value.trim(),

            institute_country:
                instituteCountry.value.trim(),

            institute_address:
                instituteAddress.value.trim(),

            academic_session:
                academicSession.value.trim(),

            current_term:
                currentTerm.value,

            updated_at:
                new Date().toISOString()

        })
        .eq(
            "id",
            existingSettings.id
        );


    if (error) {

        console.error(
            "Unable to save settings:",
            error
        );

        showMessage(
            "Unable to save settings: " +
            error.message,
            "error"
        );

    } else {

        showMessage(
            "Settings saved successfully.",
            "success"
        );
    }


    saveSettingsButton.disabled = false;

    saveSettingsButton.textContent =
        "Save Settings";
}


// ========================================
// START
// ========================================

async function initializeSettings() {

    const isAdmin =
        await checkAdmin();

    if (!isAdmin) return;

    await loadSettings();
}


initializeSettings();


// ========================================
// SAVE BUTTON
// ========================================

saveSettingsButton.addEventListener(
    "click",
    saveSettings
);