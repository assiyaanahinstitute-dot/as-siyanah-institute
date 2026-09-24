document.addEventListener("DOMContentLoaded", async function () {

    const lessonTitle =
        document.getElementById("lessonTitle");

    const lessonDescription =
        document.getElementById("lessonDescription");

    const lessonContent =
        document.getElementById("lessonContent");


    if (!lessonTitle || !lessonContent) {
        return;
    }


    // Get lesson ID from URL

    const params =
        new URLSearchParams(
            window.location.search
        );

    const lessonId =
        params.get("id");


    if (!lessonId) {

        lessonTitle.textContent =
            "Lesson Not Found";

        if (lessonDescription) {
            lessonDescription.textContent =
                "No lesson was selected.";
        }

        lessonContent.innerHTML = `
            <div class="subject-empty">

                <div class="subject-empty-icon">
                    📚
                </div>

                <h3>
                    Lesson Not Found
                </h3>

                <p>
                    Please return to your subject
                    and select a lesson.
                </p>

            </div>
        `;

        return;
    }


    try {

        // Check logged-in student

        const {
            data: { user },
            error: authError
        } = await supabaseClient.auth.getUser();


        if (authError || !user) {

            window.location.href =
                "login.html";

            return;
        }


        // Get lesson

        const {
            data: lesson,
            error: lessonError
        } = await supabaseClient
            .from("Lessons")
            .select("*")
            .eq("id", lessonId)
            .maybeSingle();


        if (lessonError) {

            console.error(
                "Lesson error:",
                lessonError
            );

            lessonTitle.textContent =
                "Unable to Load Lesson";

            lessonContent.innerHTML = `
                <div class="subject-empty">

                    <div class="subject-empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        Unable to Load Lesson
                    </h3>

                    <p>
                        ${lessonError.message}
                    </p>

                </div>
            `;

            return;
        }


        if (!lesson) {

            lessonTitle.textContent =
                "Lesson Not Found";

            lessonContent.innerHTML = `
                <div class="subject-empty">

                    <div class="subject-empty-icon">
                        📚
                    </div>

                    <h3>
                        Lesson Not Found
                    </h3>

                    <p>
                        This lesson could not be found.
                    </p>

                </div>
            `;

            return;
        }


        // Display lesson title

        lessonTitle.textContent =
            lesson.title || "Lesson";


        if (lessonDescription) {

            lessonDescription.textContent =
                lesson.description ||
                "Your lesson is ready to watch.";
        }


        let html = "";


        // =========================
        // VIDEO
        // =========================

        if (lesson.video_url) {

            console.log(
                "Video filename:",
                lesson.video_url
            );


            const {
                data: signedUrlData,
                error: signedUrlError
            } = await supabaseClient.storage
                .from("lesson-videos")
                .createSignedUrl(
                    lesson.video_url,
                    3600
                );


            console.log(
                "Signed URL:",
                signedUrlData
            );


            console.log(
                "Signed URL error:",
                signedUrlError
            );


            if (
                signedUrlError ||
                !signedUrlData ||
                !signedUrlData.signedUrl
            ) {

                html += `

                    <div class="lesson-video-error">

                        <div class="lesson-video-icon">
                            ⚠️
                        </div>

                        <h3>
                            Video Unavailable
                        </h3>

                        <p>
                            The lesson video could not
                            be loaded.
                        </p>

                    </div>

                `;

            }

            else {

                html += `

                    <div class="lesson-video-wrapper">

                        <video
                            controls
                            playsinline
                            preload="metadata"
                            class="lesson-video-player"
                        >

                            <source
                                src="${signedUrlData.signedUrl}"
                                type="video/mp4"
                            >

                            Your browser does not support
                            video playback.

                        </video>

                    </div>

                `;

            }

        }

        else {

            html += `

                <div class="lesson-video-error">

                    <div class="lesson-video-icon">
                        🎥
                    </div>

                    <h3>
                        Video Coming Soon
                    </h3>

                    <p>
                        Your teacher has not uploaded
                        a video for this lesson yet.
                    </p>

                </div>

            `;

        }


        // =========================
        // LESSON INFORMATION
        // =========================

        html += `

            <div class="lesson-information">

                <span class="lesson-information-label">
                    LESSON INFORMATION
                </span>

                <h2>
                    ${lesson.title || "Lesson"}
                </h2>

                <div class="lesson-meta">

                    <div>
                        <span>Subject</span>
                        <strong>
                            ${lesson.subject || "—"}
                        </strong>
                    </div>

                    <div>
                        <span>Level</span>
                        <strong>
                            ${lesson.level || "—"}
                        </strong>
                    </div>

                </div>

            </div>

        `;


        lessonContent.innerHTML =
            html;


    } catch (error) {

        console.error(
            "Lesson page error:",
            error
        );

        lessonTitle.textContent =
            "Something Went Wrong";

        lessonContent.innerHTML = `

            <div class="subject-empty">

                <div class="subject-empty-icon">
                    ⚠️
                </div>

                <h3>
                    Something Went Wrong
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

});