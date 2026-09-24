document.addEventListener("DOMContentLoaded", async function () {

    const container =
        document.getElementById("reviewContainer");

    const params =
        new URLSearchParams(window.location.search);

    const submissionId =
        params.get("id");


    // ========================================
    // CHECK SUBMISSION ID
    // ========================================

    if (!submissionId) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>Submission Not Found</h3>
                <p>
                    No assignment submission was specified.
                </p>
            </div>
        `;

        return;
    }


    try {

        // ========================================
        // CHECK LOGIN
        // ========================================

        const {
            data: { user },
            error: authError
        } =
            await supabaseClient.auth.getUser();


        if (authError || !user) {

            window.location.href =
                "teacher-login.html";

            return;
        }


        // ========================================
        // VERIFY TEACHER
        // ========================================

        const {
            data: teacher,
            error: teacherError
        } =
            await supabaseClient
                .from("Teachers")
                .select(`
                    id,
                    full_name,
                    role
                `)
                .eq("auth_id", user.id)
                .single();


        if (
            teacherError ||
            !teacher ||
            teacher.role !== "teacher"
        ) {

            window.location.href =
                "teacher-login.html";

            return;
        }


        // ========================================
        // LOAD SUBMISSION
        // ========================================

        const {
            data: submission,
            error: submissionError
        } =
            await supabaseClient
                .from("Assignment_Submissions")
                .select(`
                    id,
                    assignment_id,
                    student_id,
                    file_url,
                    student_message,
                    submitted_at,
                    status,
                    score,
                    teacher_feedback,
                    reviewed_at,

                    Assignments (
                        id,
                        title,
                        description,
                        subject_id,
                        level,
                        deadline
                    )
                `)
                .eq("id", submissionId)
                .single();


        if (submissionError) {
            throw submissionError;
        }


        // ========================================
        // LOAD STUDENT
        // ========================================

        const {
            data: student,
            error: studentError
        } =
            await supabaseClient
                .from("Student")
                .select(`
                    id,
                    student_id,
                    full_name,
                    email,
                    programme,
                    level
                `)
                .eq("id", submission.student_id)
                .single();


        if (studentError) {
            throw studentError;
        }


        // ========================================
        // ASSIGNMENT DATA
        // ========================================

        const assignment =
            submission.Assignments;


        const assignmentTitle =
            assignment?.title ||
            "Unknown Assignment";


        const assignmentDescription =
            assignment?.description ||
            "No description provided.";


        const level =
            assignment?.level ||
            "N/A";


        // ========================================
        // SUBMISSION DATE
        // ========================================

        const submittedDate =
            submission.submitted_at
                ? new Date(
                    submission.submitted_at
                ).toLocaleString(
                    "en-GB",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit"
                    }
                )
                : "Unknown date";


        // ========================================
        // DEADLINE
        // ========================================

        const deadlineText =
            assignment?.deadline
                ? new Date(
                    assignment.deadline
                ).toLocaleString(
                    "en-GB",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit"
                    }
                )
                : "No deadline";


        // ========================================
        // SCORE
        // ========================================

        const currentScore =
            submission.score !== null &&
            submission.score !== undefined
                ? submission.score
                : "";


        // ========================================
        // RENDER PAGE
        // ========================================

        container.innerHTML = `

            <!-- ASSIGNMENT -->
            <section class="review-card">

                <h3>Assignment Information</h3>

                <div class="assignment-info">

                    <div class="info-box">

                        <span>
                            Assignment
                        </span>

                        <strong>
                            ${assignmentTitle}
                        </strong>

                    </div>


                    <div class="info-box">

                        <span>
                            Level
                        </span>

                        <strong>
                            ${level}
                        </strong>

                    </div>


                    <div class="info-box">

                        <span>
                            Submitted
                        </span>

                        <strong>
                            ${submittedDate}
                        </strong>

                    </div>


                    <div class="info-box">

                        <span>
                            Deadline
                        </span>

                        <strong>
                            ${deadlineText}
                        </strong>

                    </div>

                </div>

            </section>


            <!-- STUDENT -->
            <section class="review-card">

                <h3>Student Information</h3>

                <div class="student-profile">

                    <div class="student-info">

                        <span>
                            Full Name
                        </span>

                        <strong>
                            ${student.full_name}
                        </strong>

                    </div>


                    <div class="student-info">

                        <span>
                            Student ID
                        </span>

                        <strong>
                            ${student.student_id}
                        </strong>

                    </div>


                    <div class="student-info">

                        <span>
                            Email
                        </span>

                        <strong>
                            ${student.email || "No email"}
                        </strong>

                    </div>


                    <div class="student-info">

                        <span>
                            Programme
                        </span>

                        <strong>
                            ${student.programme || "N/A"}
                        </strong>

                    </div>

                </div>

            </section>


            <!-- ASSIGNMENT DESCRIPTION -->
            <section class="review-card">

                <h3>Assignment Instructions</h3>

                <div class="student-message">

                    <p>
                        ${assignmentDescription}
                    </p>

                </div>

            </section>


            <!-- STUDENT MESSAGE -->
            <section class="review-card">

                <h3>Student Message</h3>

                <div class="student-message">

                    <p>
                        ${
                            submission.student_message ||
                            "The student did not include a message."
                        }
                    </p>

                </div>

            </section>


           <!-- FILE -->
<section class="review-card">

    <h3>Submitted Assignment</h3>

    <div class="file-section">

        <p id="fileLoadingMessage">
            Loading submitted file...
        </p>

        <div id="submittedFilePreview"></div>

        <button
            type="button"
            class="view-file-btn"
            id="viewFileBtn"
        >
            Open Full File
        </button>

    </div>

</section>
            <!-- REVIEW -->
            <section class="review-card">

                <h3>Teacher Review</h3>

                <form
                    id="reviewForm"
                    class="review-form"
                >

                    <div class="score-row">

                        <div class="form-group">

                            <label for="score">
                                Score
                            </label>

                            <input
                                type="number"
                                id="score"
                                min="0"
                                max="100"
                                step="0.01"
                                value="${currentScore}"
                                placeholder="Enter score"
                            >

                        </div>


                        <div class="form-group">

                            <label for="status">
                                Status
                            </label>

                            <select id="status">

                                <option
                                    value="Submitted"
                                    ${submission.status === "Submitted" ? "selected" : ""}
                                >
                                    Submitted
                                </option>

                                <option
                                    value="Reviewed"
                                    ${submission.status === "Reviewed" ? "selected" : ""}
                                >
                                    Reviewed
                                </option>

                                <option
                                    value="Returned"
                                    ${submission.status === "Returned" ? "selected" : ""}
                                >
                                    Returned
                                </option>

                            </select>

                        </div>

                    </div>


                    <div class="form-group">

                        <label for="teacherFeedback">
                            Teacher Feedback
                        </label>

                        <textarea
                            id="teacherFeedback"
                            placeholder="Write feedback for the student..."
                        >${submission.teacher_feedback || ""}</textarea>

                    </div>


                    <button
                        type="submit"
                        class="save-review-btn"
                        id="saveReviewBtn"
                    >
                        Save Review
                    </button>


                    <div
                        id="reviewMessage"
                        class="review-message"
                    ></div>

                </form>

            </section>

        `;


        // ========================================
// OPEN / PREVIEW FILE
// ========================================

const viewFileBtn =
    document.getElementById("viewFileBtn");

const filePreview =
    document.getElementById("submittedFilePreview");

const fileLoadingMessage =
    document.getElementById("fileLoadingMessage");


try {

    const {
        data,
        error
    } =
        await supabaseClient
            .storage
            .from("assignment-submissions")
            .createSignedUrl(
                submission.file_url,
                3600
            );


    if (error) {
        throw error;
    }


    const signedUrl =
        data.signedUrl;


    // ----------------------------------------
    // GET FILE TYPE
    // ----------------------------------------

    const filePath =
        submission.file_url.toLowerCase();


    const imageExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".bmp"
    ];


    const videoExtensions = [
        ".mp4",
        ".webm",
        ".mov",
        ".avi",
        ".mkv"
    ];


    const audioExtensions = [
        ".mp3",
        ".wav",
        ".ogg",
        ".m4a"
    ];


    const isImage =
        imageExtensions.some(
            extension =>
                filePath.endsWith(extension)
        );


    const isVideo =
        videoExtensions.some(
            extension =>
                filePath.endsWith(extension)
        );


    const isAudio =
        audioExtensions.some(
            extension =>
                filePath.endsWith(extension)
        );


    // ----------------------------------------
    // IMAGE
    // ----------------------------------------

    if (isImage) {

        filePreview.innerHTML = `

            <div class="image-preview">

                <img
                    src="${signedUrl}"
                    alt="Student submitted assignment"
                >

            </div>

        `;

    }


    // ----------------------------------------
    // VIDEO
    // ----------------------------------------

    else if (isVideo) {

        filePreview.innerHTML = `

            <div class="video-preview">

                <video
                    controls
                    src="${signedUrl}"
                >
                    Your browser does not support
                    video playback.
                </video>

            </div>

        `;

    }


    // ----------------------------------------
    // AUDIO
    // ----------------------------------------

    else if (isAudio) {

        filePreview.innerHTML = `

            <div class="audio-preview">

                <audio
                    controls
                    src="${signedUrl}"
                >
                </audio>

            </div>

        `;

    }


    // ----------------------------------------
    // OTHER FILES
    // ----------------------------------------

    else {

        filePreview.innerHTML = `

            <div class="generic-file">

                <div class="file-icon">
                    📄
                </div>

                <strong>
                    Student submitted a file
                </strong>

                <p>
                    This file type cannot be previewed
                    directly here.
                </p>

            </div>

        `;

    }


    fileLoadingMessage.style.display =
        "none";


    // ----------------------------------------
    // OPEN FULL FILE
    // ----------------------------------------

    viewFileBtn.addEventListener(
        "click",
        function () {

            window.open(
                signedUrl,
                "_blank"
            );

        }
    );


} catch (error) {

    console.error(
        "File preview error:",
        error
    );


    fileLoadingMessage.textContent =
        "Unable to load the submitted file.";

    viewFileBtn.style.display =
        "none";

}

        // ========================================
        // SAVE REVIEW
        // ========================================

        const reviewForm =
            document.getElementById("reviewForm");


        const saveReviewBtn =
            document.getElementById("saveReviewBtn");


        const reviewMessage =
            document.getElementById("reviewMessage");


        reviewForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const scoreInput =
                    document.getElementById("score");


                const statusInput =
                    document.getElementById("status");


                const feedbackInput =
                    document.getElementById(
                        "teacherFeedback"
                    );


                const score =
                    scoreInput.value.trim();


                const status =
                    statusInput.value;


                const feedback =
                    feedbackInput.value.trim();


                // ====================================
                // VALIDATE SCORE
                // ====================================

                if (score !== "") {

                    const numericScore =
                        Number(score);


                    if (
                        isNaN(numericScore) ||
                        numericScore < 0 ||
                        numericScore > 100
                    ) {

                        reviewMessage.className =
                            "review-message review-error";

                        reviewMessage.textContent =
                            "Score must be between 0 and 100.";

                        return;
                    }

                }


                try {

                    saveReviewBtn.disabled = true;

                    saveReviewBtn.textContent =
                        "Saving Review...";


                    reviewMessage.textContent = "";


                    // ====================================
                    // UPDATE SUBMISSION
                    // ====================================

                    const {
                        error: updateError
                    } =
                        await supabaseClient
                            .from(
                                "Assignment_Submissions"
                            )
                            .update({

                                score:
                                    score === ""
                                        ? null
                                        : Number(score),

                                teacher_feedback:
                                    feedback || null,

                                status:
                                    status,

                                reviewed_at:
                                    new Date().toISOString(),

                                reviewed_by:
                                    user.id

                            })
                            .eq(
                                "id",
                                submissionId
                            );


                    if (updateError) {
                        throw updateError;
                    }


                    // ====================================
                    // SUCCESS
                    // ====================================

                    reviewMessage.className =
                        "review-message review-success";

                    reviewMessage.textContent =
                        "Review saved successfully.";


                    saveReviewBtn.textContent =
                        "Review Saved";


                } catch (error) {

                    console.error(
                        "Review update error:",
                        error
                    );


                    reviewMessage.className =
                        "review-message review-error";

                    reviewMessage.textContent =
                        "Unable to save review. Please try again.";


                    saveReviewBtn.disabled = false;

                    saveReviewBtn.textContent =
                        "Save Review";

                }

            }
        );


    } catch (error) {

        console.error(
            "Review page error:",
            error
        );


        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Unable to Load Submission
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>

        `;

    }

});