// ========================================
// AS-SIYĀNAH INSTITUTE
// STUDENT - ASSIGNMENT PAGE
// ========================================

document.addEventListener("DOMContentLoaded", async function () {

    const container =
        document.getElementById("assignmentContainer");

    const titleElement =
        document.getElementById("assignmentTitle");

    const subjectElement =
        document.getElementById("assignmentSubject");

    const params =
        new URLSearchParams(window.location.search);

    const assignmentId =
        params.get("id");


    // ========================================
    // CHECK ASSIGNMENT ID
    // ========================================

    if (!assignmentId) {

        titleElement.textContent =
            "Assignment Not Found";

        subjectElement.textContent = "";

        container.innerHTML = `
            <div style="text-align:center;padding:50px 20px;">

                <h3>Assignment not found.</h3>

                <p>
                    Please return to the assignments page
                    and try again.
                </p>

                <a href="assignments.html">
                    Back to Assignments
                </a>

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


        if (authError) {

            console.error(
                "Authentication error:",
                authError
            );

            throw authError;
        }


        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        console.log(
            "Logged in user:",
            user.id
        );


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
                    auth_id,
                    full_name,
                    level
                `)
                .eq("auth_id", user.id)
                .single();


        if (studentError) {

            console.error(
                "Student loading error:",
                studentError
            );

            throw studentError;
        }


        if (!student) {

            throw new Error(
                "Student account could not be found."
            );
        }


        console.log(
            "Student:",
            student
        );


        // ========================================
        // LOAD ASSIGNMENT
        // ========================================

        const {
            data: assignment,
            error: assignmentError
        } =
            await supabaseClient
                .from("Assignments")
                .select(`
                    id,
                    title,
                    description,
                    level,
                    deadline,
                    published,
                    subject_id,
                    class_id
                `)
                .eq(
                    "id",
                    Number(assignmentId)
                )
                .eq(
                    "published",
                    true
                )
                .single();


        if (assignmentError) {

            console.error(
                "Assignment loading error:",
                assignmentError
            );

            throw assignmentError;
        }


        if (!assignment) {

            throw new Error(
                "Assignment could not be found."
            );
        }


        console.log(
            "Assignment:",
            assignment
        );


        // ========================================
        // CHECK LEVEL
        // ========================================

        if (
            assignment.level &&
            student.level &&
            assignment.level.toLowerCase() !==
            student.level.toLowerCase()
        ) {

            titleElement.textContent =
                "Assignment Unavailable";

            subjectElement.textContent = "";

            container.innerHTML = `
                <div style="
                    text-align:center;
                    padding:50px 20px;
                ">

                    <h3>
                        This assignment is not available
                        for your level.
                    </h3>

                    <a href="assignments.html">
                        Back to Assignments
                    </a>

                </div>
            `;

            return;
        }


        // ========================================
        // LOAD SUBJECT
        // ========================================

        let subjectName =
            "General";


        if (assignment.subject_id) {

            const {
                data: subject,
                error: subjectError
            } =
                await supabaseClient
                    .from("Subjects")
                    .select(`
                        id,
                        name
                    `)
                    .eq(
                        "id",
                        assignment.subject_id
                    )
                    .maybeSingle();


            console.log(
                "Assignment subject_id:",
                assignment.subject_id
            );

            console.log(
                "Subject:",
                subject
            );

            console.log(
                "Subject error:",
                subjectError
            );


            if (subjectError) {

                console.warn(
                    "Subject could not be loaded:",
                    subjectError
                );

            } else if (
                subject &&
                subject.name
            ) {

                subjectName =
                    subject.name;
            }
        }


        // ========================================
        // DISPLAY HEADER
        // ========================================

        titleElement.textContent =
            assignment.title;

        subjectElement.textContent =
            subjectName;


        // ========================================
        // DEADLINE
        // ========================================

        let deadlineText =
            "No deadline";


        if (assignment.deadline) {

            deadlineText =
                new Date(
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
                );
        }


        // ========================================
        // LOAD EXISTING SUBMISSION
        // ========================================

        const {
            data: existingSubmission,
            error: existingSubmissionError
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
                    reviewed_at
                `)
                .eq(
                    "assignment_id",
                    Number(assignment.id)
                )
                .eq(
                    "student_id",
                    student.id
                )
                .maybeSingle();


        if (existingSubmissionError) {

            console.error(
                "Existing submission error:",
                existingSubmissionError
            );

            throw existingSubmissionError;
        }


        console.log(
            "Existing submission:",
            existingSubmission
        );


        // ========================================
        // DISPLAY PAGE
        // ========================================

        renderAssignment(
            assignment,
            subjectName,
            deadlineText,
            existingSubmission,
            student
        );


    } catch (error) {

        console.error(
            "Assignment error:",
            error
        );


        titleElement.textContent =
            "Unable to Load Assignment";

        subjectElement.textContent = "";


        container.innerHTML = `

            <div style="
                text-align:center;
                padding:50px 20px;
            ">

                <h3>
                    Unable to load assignment.
                </h3>

                <p>
                    ${error?.message ||
                    "An unknown error occurred."}
                </p>

                <a href="assignments.html">
                    Back to Assignments
                </a>

            </div>

        `;

    }

});


// ========================================
// RENDER ASSIGNMENT
// ========================================

function renderAssignment(
    assignment,
    subjectName,
    deadlineText,
    submission,
    student
) {

    const container =
        document.getElementById(
            "assignmentContainer"
        );


    // ========================================
    // IF ALREADY SUBMITTED
    // ========================================

    if (submission) {

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
        // REVIEW STATUS
        // ========================================

        let reviewStatus =
            submission.status ||
            "Submitted";


        let reviewStatusColor =
            "#39734f";

        let reviewStatusBackground =
            "#eaf6ee";


        if (
            reviewStatus.toLowerCase() ===
            "reviewed"
        ) {

            reviewStatusColor =
                "#1d5e3c";

            reviewStatusBackground =
                "#eaf6ee";

        } else if (
            reviewStatus.toLowerCase() ===
            "returned"
        ) {

            reviewStatusColor =
                "#8a5a00";

            reviewStatusBackground =
                "#fff7df";
        }


        // ========================================
        // REVIEWED DATE
        // ========================================

        let reviewedDate = "";


        if (submission.reviewed_at) {

            reviewedDate =
                new Date(
                    submission.reviewed_at
                ).toLocaleString(
                    "en-GB",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit"
                    }
                );
        }


        container.innerHTML = `

            <div class="announcement-card">

                <div class="announcement-card-top">

                    <span class="announcement-category">
                        ${subjectName}
                    </span>

                    <span class="announcement-date">
                        ${deadlineText}
                    </span>

                </div>


                <h2>
                    ${assignment.title}
                </h2>


                <p>
                    ${assignment.description ||
                    "No instructions provided."}
                </p>


                <!-- SUBMISSION STATUS -->

                <div style="
                    margin-top:25px;
                    padding:22px;
                    background:#eaf6ee;
                    border:1px solid #cfe7d7;
                    border-radius:14px;
                ">

                    <div style="
                        font-size:13px;
                        color:#39734f;
                        font-weight:700;
                        margin-bottom:6px;
                    ">
                        ✓ ASSIGNMENT SUBMITTED
                    </div>

                    <strong style="
                        display:block;
                        color:#173d28;
                        font-size:16px;
                    ">
                        Your assignment has been submitted.
                    </strong>

                    <p style="
                        margin:7px 0 0;
                        color:#617067;
                    ">
                        Submitted on ${submittedDate}
                    </p>

                </div>


                <!-- STUDENT MESSAGE -->

                ${
                    submission.student_message
                        ? `

                            <div style="
                                margin-top:22px;
                                padding:20px;
                                background:#f5f7f6;
                                border-radius:12px;
                            ">

                                <strong>
                                    Your Message
                                </strong>

                                <p style="margin-bottom:0;">
                                    ${submission.student_message}
                                </p>

                            </div>

                        `
                        : ""
                }


                <!-- TEACHER REVIEW -->

                <div style="
                    margin-top:25px;
                    padding:22px;
                    background:#ffffff;
                    border:1px solid #dfe8e2;
                    border-radius:15px;
                ">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        gap:15px;
                        flex-wrap:wrap;
                        margin-bottom:18px;
                    ">

                        <strong style="
                            font-size:18px;
                            color:#173d28;
                        ">
                            Teacher Review
                        </strong>


                        <span style="
                            padding:7px 13px;
                            border-radius:20px;
                            background:${reviewStatusBackground};
                            color:${reviewStatusColor};
                            font-size:12px;
                            font-weight:700;
                        ">
                            ${reviewStatus}
                        </span>

                    </div>


                    ${
                        submission.score !== null &&
                        submission.score !== undefined
                            ? `

                                <div style="
                                    padding:18px;
                                    background:#f5f7f6;
                                    border-radius:12px;
                                ">

                                    <span style="
                                        display:block;
                                        font-size:12px;
                                        color:#6c7770;
                                        font-weight:600;
                                        text-transform:uppercase;
                                        letter-spacing:.5px;
                                    ">
                                        Your Score
                                    </span>

                                    <strong style="
                                        display:block;
                                        margin-top:5px;
                                        font-size:32px;
                                        color:#1d5e3c;
                                    ">
                                        ${submission.score}

                                        <span style="
                                            font-size:16px;
                                            color:#718078;
                                        ">
                                            / 100
                                        </span>

                                    </strong>

                                </div>

                            `
                            : `

                                <div style="
                                    padding:16px;
                                    background:#f8f9f8;
                                    border-radius:12px;
                                    color:#68736d;
                                ">
                                    Your assignment has not
                                    been graded yet.
                                </div>

                            `
                    }


                    ${
                        submission.teacher_feedback
                            ? `

                                <div style="
                                    margin-top:18px;
                                ">

                                    <span style="
                                        display:block;
                                        font-size:12px;
                                        color:#6c7770;
                                        font-weight:600;
                                        text-transform:uppercase;
                                        letter-spacing:.5px;
                                        margin-bottom:7px;
                                    ">
                                        Teacher Feedback
                                    </span>

                                    <div style="
                                        padding:17px;
                                        background:#f5f7f6;
                                        border-radius:12px;
                                        color:#36443b;
                                        line-height:1.7;
                                    ">
                                        ${submission.teacher_feedback}
                                    </div>

                                </div>

                            `
                            : ""
                    }


                    ${
                        reviewedDate
                            ? `

                                <p style="
                                    margin:16px 0 0;
                                    font-size:13px;
                                    color:#7a847e;
                                ">
                                    Reviewed on ${reviewedDate}
                                </p>

                            `
                            : ""
                    }

                </div>


                <!-- DELETE SUBMISSION -->

                <div style="
                    margin-top:30px;
                    padding:20px;
                    border:1px solid #f0d5d5;
                    background:#fff8f8;
                    border-radius:14px;
                ">

                    <strong style="color:#8d2929;">
                        Need to submit a different file?
                    </strong>

                    <p style="
                        margin:6px 0 15px;
                        color:#6e6666;
                    ">
                        You can delete this submission and
                        submit the correct assignment.
                    </p>


                    <button
                        type="button"
                        id="deleteSubmissionBtn"
                        style="
                            padding:12px 20px;
                            border:none;
                            border-radius:9px;
                            background:#b52d2d;
                            color:white;
                            font-weight:600;
                            cursor:pointer;
                        "
                    >
                        Delete Submission
                    </button>


                    <div
                        id="deleteMessage"
                        style="margin-top:12px;"
                    ></div>

                </div>

            </div>

        `;


        // ========================================
        // DELETE BUTTON
        // ========================================

        const deleteButton =
            document.getElementById(
                "deleteSubmissionBtn"
            );


        const deleteMessage =
            document.getElementById(
                "deleteMessage"
            );


        deleteButton.addEventListener(
            "click",
            async function () {

                const confirmed =
                    confirm(
                        "Are you sure you want to delete this submission? You will be able to submit another file afterward."
                    );


                if (!confirmed) {
                    return;
                }


                try {

                    deleteButton.disabled = true;

                    deleteButton.textContent =
                        "Deleting...";


                    deleteMessage.textContent =
                        "";


                    // =================================
                    // DELETE STORAGE FILE
                    // =================================

                    if (submission.file_url) {

                        const {
                            error: storageError
                        } =
                            await supabaseClient
                                .storage
                                .from(
                                    "assignment-submissions"
                                )
                                .remove([
                                    submission.file_url
                                ]);


                        if (storageError) {

                            console.error(
                                "Storage delete error:",
                                storageError
                            );

                            throw storageError;
                        }

                    }


                    // =================================
                    // DELETE DATABASE RECORD
                    // =================================

                    const {
                        error: deleteError
                    } =
                        await supabaseClient
                            .from(
                                "Assignment_Submissions"
                            )
                            .delete()
                            .eq(
                                "id",
                                submission.id
                            );


                    if (deleteError) {

                        console.error(
                            "Database delete error:",
                            deleteError
                        );

                        throw deleteError;
                    }


                    // =================================
                    // SUCCESS
                    // =================================

                    deleteMessage.innerHTML = `

                        <div style="
                            padding:12px;
                            background:#e8f5e9;
                            color:#1b5e20;
                            border-radius:9px;
                        ">

                            Submission deleted successfully.
                            You can now submit a new file.

                        </div>

                    `;


                    setTimeout(
                        function () {

                            window.location.reload();

                        },
                        1000
                    );


                } catch (error) {

                    console.error(
                        "Delete submission error:",
                        error
                    );


                    deleteMessage.innerHTML = `

                        <div style="
                            padding:12px;
                            background:#ffebee;
                            color:#b71c1c;
                            border-radius:9px;
                        ">

                            <strong>
                                Unable to delete submission.
                            </strong>

                            <br><br>

                            ${error?.message ||
                            error}

                        </div>

                    `;


                    deleteButton.disabled = false;

                    deleteButton.textContent =
                        "Delete Submission";

                }

            }
        );


        return;
    }


    // ========================================
    // NO SUBMISSION — SHOW FORM
    // ========================================

    container.innerHTML = `

        <div class="announcement-card">

            <div class="announcement-card-top">

                <span class="announcement-category">
                    ${subjectName}
                </span>

                <span class="announcement-date">
                    ${deadlineText}
                </span>

            </div>


            <h2>
                ${assignment.title}
            </h2>


            <p>
                ${assignment.description ||
                "No instructions provided."}
            </p>


            <!-- ASSIGNMENT INSTRUCTIONS -->

            <div style="
                margin-top:25px;
                padding:20px;
                background:#f5f7f6;
                border-radius:12px;
            ">

                <strong>
                    Assignment Instructions
                </strong>

                <p style="margin-bottom:0;">
                    ${assignment.description ||
                    "No instructions provided."}
                </p>

            </div>


            <!-- DEADLINE -->

            <div style="
                margin-top:20px;
                padding:18px;
                background:#eef7f1;
                border-radius:12px;
            ">

                <strong>
                    Deadline
                </strong>

                <p style="margin-bottom:0;">
                    ${deadlineText}
                </p>

            </div>


            <!-- SUBMISSION FORM -->

            <div style="
                margin-top:30px;
                padding:25px;
                border:1px solid #e5e7eb;
                border-radius:16px;
                background:#ffffff;
            ">

                <h3>
                    Submit Your Assignment
                </h3>

                <p>
                    Upload your completed assignment
                    and add a message if necessary.
                </p>


                <form id="submissionForm">

                    <div style="margin-top:20px;">

                        <label for="assignmentFile">
                            Assignment File
                        </label>


                        <input
                            type="file"
                            id="assignmentFile"
                            required
                            style="
                                display:block;
                                width:100%;
                                margin-top:8px;
                                padding:12px;
                                border:1px solid #ddd;
                                border-radius:8px;
                            "
                        >


                        <small style="
                            display:block;
                            margin-top:7px;
                            color:#737b76;
                        ">
                            You can submit any file type.
                        </small>

                    </div>


                    <div style="margin-top:20px;">

                        <label for="studentMessage">
                            Message (Optional)
                        </label>


                        <textarea
                            id="studentMessage"
                            rows="5"
                            placeholder="Write a message to your teacher..."
                            style="
                                display:block;
                                width:100%;
                                margin-top:8px;
                                padding:12px;
                                border:1px solid #ddd;
                                border-radius:8px;
                                resize:vertical;
                            "
                        ></textarea>

                    </div>


                    <button
                        type="submit"
                        id="submitAssignmentBtn"
                        style="
                            margin-top:20px;
                            padding:13px 24px;
                            border:none;
                            border-radius:8px;
                            cursor:pointer;
                        "
                    >
                        Submit Assignment
                    </button>


                    <div
                        id="submissionMessage"
                        style="margin-top:15px;"
                    ></div>

                </form>

            </div>

        </div>

    `;


    // ========================================
    // SUBMISSION FORM
    // ========================================

    const submissionForm =
        document.getElementById(
            "submissionForm"
        );


    const fileInput =
        document.getElementById(
            "assignmentFile"
        );


    const messageInput =
        document.getElementById(
            "studentMessage"
        );


    const submitButton =
        document.getElementById(
            "submitAssignmentBtn"
        );


    const submissionMessage =
        document.getElementById(
            "submissionMessage"
        );


    submissionForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const file =
                fileInput.files[0];


            const studentMessage =
                messageInput.value.trim();


            if (!file) {

                submissionMessage.innerHTML = `

                    <div style="
                        padding:12px;
                        background:#fff3cd;
                        color:#856404;
                        border-radius:9px;
                    ">

                        Please select a file.

                    </div>

                `;

                return;
            }


            try {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Submitting...";


                submissionMessage.innerHTML = `

                    <div style="
                        padding:12px;
                        background:#f5f7f6;
                        color:#526158;
                        border-radius:9px;
                    ">

                        Uploading your assignment...

                    </div>

                `;


                // =================================
                // FILE EXTENSION
                // =================================

                const fileExtension =
                    file.name.includes(".")
                        ? file.name
                            .split(".")
                            .pop()
                            .toLowerCase()
                        : "";


                // =================================
                // UNIQUE FILE NAME
                // =================================

                const fileName =
                    Date.now() +
                    "_" +
                    Math.random()
                        .toString(36)
                        .substring(2) +
                    (
                        fileExtension
                            ? "." + fileExtension
                            : ""
                    );


                // =================================
                // FILE PATH
                // ========================================

                // IMPORTANT:
                // Use assignment.id here.
                // Do NOT use assignmentId.

                const filePath =
                    student.id +
                    "/" +
                    assignment.id +
                    "/" +
                    fileName;


                console.log(
                    "Preparing submission..."
                );

                console.log(
                    "Student ID:",
                    student.id
                );

                console.log(
                    "Assignment ID:",
                    assignment.id
                );

                console.log(
                    "File path:",
                    filePath
                );

                console.log(
                    "File name:",
                    file.name
                );

                console.log(
                    "File size:",
                    file.size
                );


                // =================================
                // UPLOAD FILE
                // =================================

                submissionMessage.innerHTML = `

                    <div style="
                        padding:12px;
                        background:#f5f7f6;
                        color:#526158;
                        border-radius:9px;
                    ">

                        Uploading file...

                    </div>

                `;


                const {
                    data: uploadData,
                    error: uploadError
                } =
                    await supabaseClient
                        .storage
                        .from(
                            "assignment-submissions"
                        )
                        .upload(
                            filePath,
                            file,
                            {
                                cacheControl: "3600",
                                upsert: false
                            }
                        );


                console.log(
                    "Upload result:",
                    uploadData
                );

                console.log(
                    "Upload error:",
                    uploadError
                );


                if (uploadError) {

                    throw new Error(
                        "File upload failed: " +
                        uploadError.message
                    );
                }


                // =================================
                // SAVE DATABASE RECORD
                // =================================

                submissionMessage.innerHTML = `

                    <div style="
                        padding:12px;
                        background:#f5f7f6;
                        color:#526158;
                        border-radius:9px;
                    ">

                        Saving your submission...

                    </div>

                `;


                const {
                    data: submissionData,
                    error: databaseError
                } =
                    await supabaseClient
                        .from(
                            "Assignment_Submissions"
                        )
                        .insert({

                            assignment_id:
                                Number(assignment.id),

                            student_id:
                                student.id,

                            file_url:
                                filePath,

                            student_message:
                                studentMessage || null,

                            status:
                                "Submitted"

                        })
                        .select()
                        .single();


                console.log(
                    "Submission data:",
                    submissionData
                );

                console.log(
                    "Database error:",
                    databaseError
                );


                // =================================
                // DATABASE INSERT FAILED
                // =================================

                if (databaseError) {

                    console.error(
                        "Database submission failed:",
                        databaseError
                    );


                    // Remove uploaded file because
                    // database submission failed.

                    const {
                        error: cleanupError
                    } =
                        await supabaseClient
                            .storage
                            .from(
                                "assignment-submissions"
                            )
                            .remove([
                                filePath
                            ]);


                    console.log(
                        "Uploaded file cleanup:",
                        cleanupError
                    );


                    throw new Error(
                        "Submission could not be saved: " +
                        databaseError.message
                    );
                }


                // =================================
                // SUCCESS
                // =================================

                submissionMessage.innerHTML = `

                    <div style="
                        padding:15px;
                        background:#e8f5e9;
                        color:#1b5e20;
                        border-radius:10px;
                    ">

                        <strong>
                            Assignment submitted successfully!
                        </strong>

                        <br><br>

                        Your teacher can now review your
                        submission.

                    </div>

                `;


                setTimeout(
                    function () {

                        window.location.reload();

                    },
                    1200
                );


            } catch (error) {

                console.error(
                    "================================"
                );

                console.error(
                    "SUBMISSION ERROR"
                );

                console.error(
                    "================================"
                );

                console.error(
                    "Error:",
                    error
                );

                console.error(
                    "Message:",
                    error?.message
                );


                submissionMessage.innerHTML = `

                    <div style="
                        padding:15px;
                        background:#ffebee;
                        color:#b71c1c;
                        border:1px solid #ffcdd2;
                        border-radius:10px;
                    ">

                        <strong>
                            Unable to submit assignment.
                        </strong>

                        <br><br>

                        ${error?.message ||
                        "An unknown error occurred."}

                    </div>

                `;


                submitButton.disabled = false;

                submitButton.textContent =
                    "Submit Assignment";

            }

        }
    );

}