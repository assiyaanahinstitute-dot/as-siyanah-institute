// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER PORTAL - EDIT LESSON
// ========================================

// ========================================
// SUPABASE CONNECTION
// ========================================

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
// GET LESSON ID FROM URL
// ========================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const lessonId =
    urlParams.get("id");


// ========================================
// FORM ELEMENTS
// ========================================

const editLessonForm =
    document.getElementById(
        "editLessonForm"
    );

const subjectInput =
    document.getElementById(
        "lessonSubject"
    );

const levelInput =
    document.getElementById(
        "lessonLevel"
    );

const titleInput =
    document.getElementById(
        "lessonTitle"
    );

const descriptionInput =
    document.getElementById(
        "lessonDescription"
    );

const videoInput =
    document.getElementById(
        "lessonVideo"
    );

const publishedInput =
    document.getElementById(
        "lessonPublished"
    );

const updateButton =
    document.getElementById(
        "updateLessonButton"
    );


// ========================================
// CHECK LESSON ID
// ========================================

if (!lessonId) {

    alert(
        "No lesson was selected."
    );

    window.location.href =
        "teacher-lessons.html";
}


// ========================================
// LOAD SUBJECTS
// ========================================

async function loadSubjects() {

    try {

        const {
            data: subjects,
            error
        } = await supabaseClient
            .from("Subjects")
            .select("id, name")
            .eq("active", true)
            .order("name", {
                ascending: true
            });


        if (error) {

            console.error(
                "Unable to load subjects:",
                error
            );

            subjectInput.innerHTML =
                `<option value="">
                    Unable to load subjects
                </option>`;

            return false;
        }


        // Clear existing options

        subjectInput.innerHTML =
            `<option value="">
                Select a subject
            </option>`;


        if (!subjects || subjects.length === 0) {

            subjectInput.innerHTML =
                `<option value="">
                    No active subjects available
                </option>`;

            return false;
        }


        // Add subjects

        subjects.forEach(function (subject) {

            const option =
                document.createElement("option");

            option.value =
                subject.id;

            option.textContent =
                subject.name;

            option.dataset.name =
                subject.name;

            subjectInput.appendChild(
                option
            );

        });


        console.log(
            "Subjects loaded:",
            subjects
        );

        return true;


    } catch (error) {

        console.error(
            "Unexpected subject loading error:",
            error
        );

        subjectInput.innerHTML =
            `<option value="">
                Unable to load subjects
            </option>`;

        return false;
    }
}


// ========================================
// LOAD LESSON
// ========================================

async function loadLesson() {

    try {

        console.log(
            "Loading lesson:",
            lessonId
        );


        const {
            data: lesson,
            error
        } = await supabaseClient
            .from("Lessons")
            .select(`
                id,
                title,
                description,
                subject,
                subject_id,
                level,
                video_url,
                published
            `)
            .eq("id", lessonId)
            .single();


        if (error) {

            console.error(
                "Unable to load lesson:",
                error
            );

            alert(
                "Unable to load lesson:\n\n" +
                error.message
            );

            window.location.href =
                "teacher-lessons.html";

            return;
        }


        if (!lesson) {

            alert(
                "Lesson not found."
            );

            window.location.href =
                "teacher-lessons.html";

            return;
        }


        // ========================================
        // PUT LESSON DATA INTO FORM
        // ========================================

        subjectInput.value =
            lesson.subject_id || "";

        levelInput.value =
            lesson.level || "";

        titleInput.value =
            lesson.title || "";

        descriptionInput.value =
            lesson.description || "";

        videoInput.value =
            lesson.video_url || "";

        publishedInput.checked =
            lesson.published === true;


        console.log(
            "Lesson loaded successfully:",
            lesson
        );


    } catch (error) {

        console.error(
            "Unexpected error:",
            error
        );

        alert(
            "Something went wrong while loading the lesson."
        );

    }

}


// ========================================
// UPDATE LESSON
// ========================================

editLessonForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // ========================================
        // GET SELECTED SUBJECT
        // ========================================

        const subjectId =
            subjectInput.value;


        const selectedOption =
            subjectInput.options[
                subjectInput.selectedIndex
            ];


        const subjectName =
            selectedOption
                ? selectedOption.dataset.name
                : "";


        const level =
            levelInput.value;

        const title =
            titleInput.value.trim();

        const description =
            descriptionInput.value.trim();

        const videoUrl =
            videoInput.value.trim();

        const published =
            publishedInput.checked;


        // ========================================
        // VALIDATION
        // ========================================

        if (!subjectId || !subjectName) {

            alert(
                "Please select a subject."
            );

            return;
        }


        if (!level) {

            alert(
                "Please select a level."
            );

            return;
        }


        if (!title) {

            alert(
                "Please enter a lesson title."
            );

            return;
        }


        // ========================================
        // DISABLE BUTTON
        // ========================================

        updateButton.disabled = true;

        updateButton.textContent =
            "Saving Changes...";


        try {

            // ========================================
            // UPDATE DATABASE
            // ========================================

            const {
                data,
                error
            } = await supabaseClient
                .from("Lessons")
                .update({
                    subject: subjectName,
                    subject_id: parseInt(
                        subjectId,
                        10
                    ),
                    level: level,
                    title: title,
                    description: description,
                    video_url: videoUrl || null,
                    published: published
                })
                .eq("id", lessonId)
                .select();


            // ========================================
            // CHECK ERROR
            // ========================================

            if (error) {

                console.error(
                    "Update lesson error:",
                    error
                );

                alert(
                    "Unable to update lesson:\n\n" +
                    error.message
                );

                return;
            }


            console.log(
                "Lesson updated:",
                data
            );


            // ========================================
            // SUCCESS
            // ========================================

            alert(
                "Lesson updated successfully!"
            );


            window.location.href =
                "teacher-lessons.html";


        } catch (error) {

            console.error(
                "Unexpected error:",
                error
            );

            alert(
                "Something went wrong while updating the lesson."
            );

        } finally {

            updateButton.disabled = false;

            updateButton.textContent =
                "Save Changes";
        }

    }
);


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        // Load subjects first

        const subjectsLoaded =
            await loadSubjects();


        // Then load lesson

        if (subjectsLoaded) {

            await loadLesson();

        }

    }
);