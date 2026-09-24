document.addEventListener("DOMContentLoaded", async function () {

    const subjectTitle =
        document.getElementById("subjectTitle");

    const subjectArabic =
        document.getElementById("subjectArabic");

    const lessonsContainer =
        document.getElementById("lessonsContainer");


    const params =
        new URLSearchParams(
            window.location.search
        );

    const subject =
        params.get("subject");


    if (!subject) {
        subjectTitle.textContent = "Subject Not Found";
        return;
    }


    // Arabic subject names

    const arabicNames = {

        "Nahwu": "النحو",
        "Sarf": "الصرف",
        "Reading Comprehension": "فهم المقروء",
        "Conversation": "المحادثة",
        "Vocabulary Development": "تنمية المفردات",
        "Writing & Composition": "الكتابة والإنشاء",
        "Dictation": "الإملاء",
        "Arabic Stories": "القصص العربية",
        "Listening Comprehension": "فهم المسموع",

        "Qur'an & Tajweed": "القرآن والتجويد",
        "Aqeedah": "العقيدة",
        "Fiqh": "الفقه",
        "Hadith": "الحديث",
        "Seerah": "السيرة النبوية",
        "Tafsir of Selected Surahs": "تفسير سور مختارة",
        "Islamic Manners & Character": "الآداب والأخلاق الإسلامية",
        "Stories of the Companions": "قصص الصحابة",
        "Islamic History": "التاريخ الإسلامي"

    };


    subjectTitle.textContent = subject;


    if (subjectArabic) {
        subjectArabic.textContent =
            arabicNames[subject] || "";
    }


    try {

        // Check login

        const {
            data: { user },
            error: authError
        } = await supabaseClient.auth.getUser();


        if (authError || !user) {

            window.location.href =
                "login.html";

            return;
        }


        // Get student level

        const {
            data: student,
            error: studentError
        } = await supabaseClient
            .from("Student")
            .select("level")
            .eq("auth_id", user.id)
            .maybeSingle();


        if (studentError) {
            throw studentError;
        }


        if (!student) {
            throw new Error(
                "Student profile not found."
            );
        }


        const studentLevel =
            student.level.trim().toLowerCase();


        /*
         * Get ALL published lessons
         * for this subject first.
         *
         * We will then match the
         * student's level in JavaScript.
         */

        const {
            data: lessons,
            error: lessonsError
        } = await supabaseClient
            .from("Lessons")
            .select("*")
            .eq("subject", subject)
            .eq("published", true)
            .order("created_at", {
                ascending: false
            });


        if (lessonsError) {
            throw lessonsError;
        }


        console.log(
            "Student level:",
            studentLevel
        );

        console.log(
            "Lessons found:",
            lessons
        );


        /*
         * Work out the student's level.
         */

        let allowedLevels = [];


        if (
            studentLevel === "beginner" ||
            studentLevel === "Level 1 — beginner"
        ) {

            allowedLevels = [
                "Beginner",
                "Level 1 — Beginner"
            ];

        }


        else if (
            studentLevel === "elementary" ||
            studentLevel === "intermediate" ||
            studentLevel ===
                "Level 2 — elementary / intermediate"
        ) {

            allowedLevels = [
                "Elementary",
                "Intermediate",
                "Level 2 — Elementary / Intermediate"
            ];

        }


        else if (
            studentLevel === "advanced" ||
            studentLevel ===
                "Level 3 — intermediate / advanced"
        ) {

            allowedLevels = [
                "Advanced",
                "Level 3 — Intermediate / Advanced"
            ];

        }


        /*
         * Filter lessons according
         * to the student's level.
         */

        const matchingLessons =
            (lessons || []).filter(function (lesson) {

                return allowedLevels.includes(
                    lesson.level
                );

            });


        lessonsContainer.innerHTML = "";


        if (matchingLessons.length === 0) {

            lessonsContainer.innerHTML = `

                <div class="subject-empty">

                    <div class="subject-empty-icon">
                        📚
                    </div>

                    <h3>
                        No Lessons Yet
                    </h3>

                    <p>
                        Your teacher has not added
                        any lessons for this subject
                        at your level yet.
                    </p>

                </div>

            `;

            return;
        }


        /*
         * Display lessons
         */

        matchingLessons.forEach(function (lesson) {

            const card =
                document.createElement("a");


            card.className =
                "lesson-card";


            /*
             * IMPORTANT:
             * Pass the subject along
             * with the lesson ID.
             */

            card.href =
                "lesson.html?id=" +
                encodeURIComponent(lesson.id) +
                "&subject=" +
                encodeURIComponent(subject);


            card.innerHTML = `

                <div class="lesson-card-icon">
                    ▶
                </div>

                <div class="lesson-card-content">

                    <h3>
                        ${lesson.title || "Lesson"}
                    </h3>

                    <p>
                        ${lesson.description ||
                        "Watch this lesson."}
                    </p>

                </div>

                <div class="lesson-card-arrow">
                    →
                </div>

            `;


            lessonsContainer.appendChild(card);

        });


    } catch (error) {

        console.error(
            "Subject page error:",
            error
        );


        lessonsContainer.innerHTML = `

            <div class="subject-empty">

                <div class="subject-empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to Load Lessons
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

});