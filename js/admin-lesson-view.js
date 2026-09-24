document.addEventListener("DOMContentLoaded", async function () {

    const lessonMessage =
        document.getElementById("lessonMessage");

    const lessonDetails =
        document.getElementById("lessonDetails");

    const videoPlayer =
        document.getElementById("lessonVideoPlayer");

    const videoMessage =
        document.getElementById("lessonVideoMessage");


    try {

        // ========================================
        // CHECK ADMIN LOGIN
        // ========================================

        const { data: sessionData, error: sessionError } =
            await supabaseClient.auth.getSession();

        if (sessionError) {
            throw sessionError;
        }

        if (!sessionData.session) {
            window.location.href = "admin-login.html";
            return;
        }


        // ========================================
        // GET LESSON ID
        // ========================================

        const params =
            new URLSearchParams(
                window.location.search
            );

        const lessonId =
            params.get("id");

        console.log("Lesson ID:", lessonId);


        if (!lessonId) {
            throw new Error(
                "Lesson ID was not provided."
            );
        }


        // ========================================
        // LOAD LESSON
        // ========================================

        const { data: lesson, error } =
            await supabaseClient
                .from("Lessons")
                .select(`
                    id,
                    title,
                    description,
                    subject,
                    level,
                    video_url,
                    published
                `)
                .eq("id", lessonId)
                .single();


        if (error) {
            throw error;
        }


        if (!lesson) {
            throw new Error(
                "Lesson not found."
            );
        }


        console.log(
            "Lesson loaded:",
            lesson
        );


        // ========================================
        // DISPLAY LESSON INFORMATION
        // ========================================

        const lessonName =
            document.getElementById("lessonName");

        const lessonSubject =
            document.getElementById("lessonSubject");

        const lessonIdElement =
            document.getElementById("lessonId");

        const lessonTitle =
            document.getElementById("lessonTitle");

        const lessonSubjectDetail =
            document.getElementById(
                "lessonSubjectDetail"
            );

        const lessonLevel =
            document.getElementById("lessonLevel");

        const lessonPublished =
            document.getElementById(
                "lessonPublished"
            );

        const lessonDescription =
            document.getElementById(
                "lessonDescription"
            );


        if (lessonName) {
            lessonName.textContent =
                lesson.title || "N/A";
        }

        if (lessonSubject) {
            lessonSubject.textContent =
                lesson.subject || "N/A";
        }

        if (lessonIdElement) {
            lessonIdElement.textContent =
                lesson.id || "N/A";
        }

        if (lessonTitle) {
            lessonTitle.textContent =
                lesson.title || "N/A";
        }

        if (lessonSubjectDetail) {
            lessonSubjectDetail.textContent =
                lesson.subject || "N/A";
        }

        if (lessonLevel) {
            lessonLevel.textContent =
                lesson.level || "N/A";
        }

        if (lessonPublished) {
            lessonPublished.textContent =
                lesson.published
                    ? "Published"
                    : "Draft";
        }

        if (lessonDescription) {
            lessonDescription.textContent =
                lesson.description ||
                "No description available.";
        }


       // ========================================
// VIDEO PLAYER
// ========================================

if (videoPlayer) {

    if (lesson.video_url) {

        const { data: signedUrlData, error: videoError } =
            await supabaseClient.storage
                .from("lesson-videos")
                .createSignedUrl(
                    lesson.video_url,
                    3600
                );

        if (videoError) {
            console.error(
                "Video URL error:",
                videoError
            );

            videoPlayer.style.display = "none";

            if (videoMessage) {
                videoMessage.textContent =
                    "Unable to load lesson video.";
            }

        } else {

            const videoUrl =
                signedUrlData.signedUrl;

            console.log(
                "SIGNED VIDEO URL:",
                videoUrl
            );

            videoPlayer.src = videoUrl;
            videoPlayer.controls = true;
            videoPlayer.style.display = "block";

            videoPlayer.load();

            if (videoMessage) {
                videoMessage.textContent =
                    "Video ready to play.";
            }
        }

    } else {

        videoPlayer.style.display = "none";

        if (videoMessage) {
            videoMessage.textContent =
                "No video has been added to this lesson.";
        }
    }
}
        // ========================================
        // SHOW LESSON
        // ========================================

        if (lessonMessage) {
            lessonMessage.style.display =
                "none";
        }

        if (lessonDetails) {
            lessonDetails.style.display =
                "block";
        }


    } catch (error) {

        console.error(
            "ADMIN LESSON VIEW ERROR:",
            error
        );

        if (lessonMessage) {
            lessonMessage.style.display =
                "block";

            lessonMessage.textContent =
                "Unable to load lesson: " +
                error.message;
        }

        if (lessonDetails) {
            lessonDetails.style.display =
                "none";
        }

    }

});