// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER TEST REVIEW
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
// GET ATTEMPT ID
// ========================================

const params =
    new URLSearchParams(
        window.location.search
    );

const attemptId =
    params.get("id");


if (!attemptId) {

    window.location.href =
        "teacher-test-submissions.html";
}


// ========================================
// ELEMENTS
// ========================================

const loading =
    document.getElementById("loading");

const reviewContent =
    document.getElementById("reviewContent");

const message =
    document.getElementById("message");

const questionsContainer =
    document.getElementById("questionsContainer");

const finalFeedback =
    document.getElementById("finalFeedback");

const saveReviewBtn =
    document.getElementById("saveReviewBtn");


// ========================================
// MESSAGE
// ========================================

function showMessage(
    text,
    type = "error"
) {

    message.innerHTML = `
        <div class="message-${type}">
            ${escapeHtml(text)}
        </div>
    `;

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ========================================
// CHECK TEACHER
// ========================================

async function checkTeacher() {

    const {
        data: {
            user
        }
    } =
        await supabaseClient.auth.getUser();


    if (!user) {

        window.location.href =
            "teacher-login.html";

        return null;
    }


    const {
        data: teacher,
        error
    } =
        await supabaseClient
            .from("Teachers")
            .select(
                "id, auth_id, full_name, email, role"
            )
            .eq(
                "auth_id",
                user.id
            )
            .eq(
                "role",
                "teacher"
            )
            .maybeSingle();


    if (error) {

        console.error(
            "Teacher check error:",
            error
        );

        showMessage(
            "Unable to verify teacher account."
        );

        return null;
    }


    if (!teacher) {

        showMessage(
            "You are not authorized to access this page."
        );

        return null;
    }


    return teacher;
}


// ========================================
// LOAD ATTEMPT
// ========================================

async function loadAttempt() {

    const {
        data: attempt,
        error: attemptError
    } =
        await supabaseClient
            .from("Test_Attempts")
            .select(`
                id,
                test_id,
                student_id,
                started_at,
                submitted_at,
                score,
                status,
                teacher_feedback,
                created_at,

                Tests (
                    id,
                    title,
                    description,
                    level,
                    duration_minutes,

                    Subjects (
                        name
                    )
                )
            `)
            .eq(
                "id",
                attemptId
            )
            .single();


    if (attemptError) {

        console.error(
            "Attempt error:",
            attemptError
        );

        throw new Error(
            "Unable to load test submission: " +
            attemptError.message
        );
    }


    // ========================================
    // STUDENT
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
                level,
                programme
            `)
            .eq(
                "id",
                attempt.student_id
            )
            .single();


    if (studentError) {

        console.error(
            "Student error:",
            studentError
        );

        throw new Error(
            "Unable to load student information: " +
            studentError.message
        );
    }


    // ========================================
    // QUESTIONS
    // ========================================

    const {
        data: questions,
        error: questionsError
    } =
        await supabaseClient
            .from("Test_Questions")
            .select(`
                id,
                test_id,
                question_text,
                question_type,
                options,
                correct_answer,
                marks,
                question_order
            `)
            .eq(
                "test_id",
                attempt.test_id
            )
            .order(
                "question_order",
                {
                    ascending: true
                }
            );


    if (questionsError) {

        throw new Error(
            "Unable to load test questions: " +
            questionsError.message
        );
    }


    // ========================================
    // ANSWERS
    // ========================================

    const {
        data: answers,
        error: answersError
    } =
        await supabaseClient
            .from("Test_Answers")
            .select(`
                id,
                attempt_id,
                question_id,
                answer,
                marks_awarded
            `)
            .eq(
                "attempt_id",
                attemptId
            );


    if (answersError) {

        throw new Error(
            "Unable to load student answers: " +
            answersError.message
        );
    }


    return {
        attempt,
        student,
        questions:
            questions || [],
        answers:
            answers || []
    };
}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(value) {

    if (!value) {
        return "—";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return "—";
    }

    return date.toLocaleString(
        "en-NG",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}


// ========================================
// NORMALIZE ANSWER
// ========================================

function normalizeAnswer(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .trim()
        .toLowerCase();
}


// ========================================
// RENDER PAGE
// ========================================

function renderPage(data) {

    const {
        attempt,
        student,
        questions,
        answers
    } = data;


    const test =
        attempt.Tests;


    const subject =
        test?.Subjects?.name ||
        "No subject";


    // ========================================
    // HEADER
    // ========================================

    document.getElementById(
        "testTitle"
    ).textContent =
        test?.title ||
        "Test";


    document.getElementById(
        "testDescription"
    ).textContent =
        test?.description ||
        "Review the student's submission.";


    document.getElementById(
        "studentName"
    ).textContent =
        student?.full_name ||
        "Unknown Student";


    document.getElementById(
        "studentDetails"
    ).textContent =
        `${student?.student_id || "—"} • ${student?.email || "—"}`;


    document.getElementById(
        "subjectName"
    ).textContent =
        subject;


    document.getElementById(
        "testLevel"
    ).textContent =
        test?.level ||
        student?.level ||
        "—";


    document.getElementById(
        "currentScore"
    ).textContent =
        attempt.score !== null &&
        attempt.score !== undefined
            ? attempt.score
            : "Pending";


    document.getElementById(
        "attemptStatus"
    ).textContent =
        `${attempt.status || "Submitted"} • ${formatDate(attempt.submitted_at)}`;


    document.getElementById(
        "questionCount"
    ).textContent =
        `${questions.length} ${
            questions.length === 1
                ? "Question"
                : "Questions"
        }`;


    // ========================================
    // LOAD EXISTING FEEDBACK
    // ========================================

    if (finalFeedback) {

        finalFeedback.value =
            attempt.teacher_feedback || "";

    }


    // ========================================
    // ANSWER MAP
    // ========================================

    const answerMap =
        new Map();


    answers.forEach(
        answer => {

            answerMap.set(
                String(
                    answer.question_id
                ),
                answer
            );

        }
    );


    // ========================================
    // QUESTIONS
    // ========================================

    questionsContainer.innerHTML =
        questions
            .map(
                (question, index) => {

                    const answer =
                        answerMap.get(
                            String(
                                question.id
                            )
                        );


                    const studentAnswer =
                        answer?.answer ||
                        "No answer submitted";


                    const correctAnswer =
                        question.correct_answer;


                    const isObjective =
                        question.question_type ===
                            "multiple_choice" ||
                        question.question_type ===
                            "true_false";


                    let isCorrect =
                        false;


                    if (
                        isObjective &&
                        correctAnswer !== null &&
                        correctAnswer !== undefined
                    ) {

                        isCorrect =
                            normalizeAnswer(
                                studentAnswer
                            ) ===
                            normalizeAnswer(
                                correctAnswer
                            );

                    }


                    const marks =
                        Number(
                            question.marks || 0
                        );


                    const awarded =
                        answer?.marks_awarded !== null &&
                        answer?.marks_awarded !== undefined
                            ? answer.marks_awarded
                            : (
                                isCorrect
                                    ? marks
                                    : 0
                            );


                    return `
                        <article
                            class="question-card"
                            data-question-id="${
                                question.id
                            }"
                        >

                            <div class="question-top">

                                <span class="question-number">
                                    Question ${
                                        index + 1
                                    }
                                </span>

                                <span class="question-marks">
                                    ${marks} ${
                                        marks === 1
                                            ? "mark"
                                            : "marks"
                                    }
                                </span>

                            </div>


                            <div class="question-text">
                                ${
                                    escapeHtml(
                                        question.question_text
                                    )
                                }
                            </div>


                            <div class="answer-box ${
                                isCorrect
                                    ? "correct-box"
                                    : (
                                        isObjective &&
                                        studentAnswer !==
                                            "No answer submitted"
                                            ? "wrong-box"
                                            : ""
                                    )
                            }">

                                <span class="answer-label">
                                    Student Answer
                                </span>

                                <div class="answer-text">
                                    ${
                                        escapeHtml(
                                            studentAnswer
                                        )
                                    }
                                </div>

                            </div>


                            ${
                                correctAnswer !== null &&
                                correctAnswer !== undefined &&
                                correctAnswer !== ""
                                    ? `
                                        <div class="answer-box correct-box">

                                            <span class="answer-label">
                                                Correct Answer
                                            </span>

                                            <div class="answer-text">
                                                ${
                                                    escapeHtml(
                                                        correctAnswer
                                                    )
                                                }
                                            </div>

                                        </div>
                                    `
                                    : ""
                            }


                            <div class="mark-row">

                                <span class="mark-info">
                                    Marks awarded
                                </span>

                                <input
                                    type="number"
                                    class="mark-input"
                                    min="0"
                                    max="${marks}"
                                    step="0.5"
                                    value="${awarded}"
                                    data-question-id="${
                                        question.id
                                    }"
                                >

                            </div>

                        </article>
                    `;
                }
            )
            .join("");
}


// ========================================
// SAVE REVIEW
// ========================================

async function saveReview() {

    saveReviewBtn.disabled = true;

    saveReviewBtn.textContent =
        "Saving...";


    try {

        const {
            data: {
                user
            }
        } =
            await supabaseClient.auth.getUser();


        if (!user) {

            throw new Error(
                "Your session has expired. Please log in again."
            );
        }


        // ========================================
        // GET ATTEMPT
        // ========================================

        const {
            data: currentAttempt,
            error: currentAttemptError
        } =
            await supabaseClient
                .from("Test_Attempts")
                .select(
                    "test_id"
                )
                .eq(
                    "id",
                    attemptId
                )
                .single();


        if (currentAttemptError) {

            throw new Error(
                "Unable to load test attempt: " +
                currentAttemptError.message
            );
        }


        // ========================================
        // GET QUESTIONS
        // ========================================

        const {
            data: questions,
            error: questionError
        } =
            await supabaseClient
                .from("Test_Questions")
                .select(
                    "id, marks"
                )
                .eq(
                    "test_id",
                    currentAttempt.test_id
                );


        if (questionError) {

            throw new Error(
                questionError.message
            );
        }


        // ========================================
        // UPDATE ANSWERS
        // ========================================

        let totalScore = 0;


        for (
            const question of questions || []
        ) {

            const input =
                document.querySelector(
                    `.mark-input[data-question-id="${question.id}"]`
                );


            if (!input) {
                continue;
            }


            let marks =
                Number(
                    input.value
                );


            if (
                Number.isNaN(marks) ||
                marks < 0
            ) {

                marks = 0;

            }


            const maxMarks =
                Number(
                    question.marks || 0
                );


            if (
                marks > maxMarks
            ) {

                marks = maxMarks;

            }


            totalScore += marks;


            const {
                error
            } =
                await supabaseClient
                    .from("Test_Answers")
                    .update({
                        marks_awarded: marks
                    })
                    .eq(
                        "attempt_id",
                        attemptId
                    )
                    .eq(
                        "question_id",
                        question.id
                    );


            if (error) {

                throw new Error(
                    "Unable to save question marks: " +
                    error.message
                );

            }

        }


        // ========================================
        // GET TEACHER FEEDBACK
        // ========================================

        const teacherFeedback =
            finalFeedback
                ? finalFeedback.value.trim()
                : "";


        // ========================================
        // SAVE SCORE + FEEDBACK
        // ========================================

        const {
            error: attemptError
        } =
            await supabaseClient
                .from("Test_Attempts")
                .update({
                    score: totalScore,
                    status: "Reviewed",
                    teacher_feedback:
                        teacherFeedback || null
                })
                .eq(
                    "id",
                    attemptId
                );


        if (attemptError) {

            throw new Error(
                "Unable to update test review: " +
                attemptError.message
            );

        }


        // ========================================
        // SUCCESS
        // ========================================

        showMessage(
            "Review saved successfully. Score and teacher feedback have been updated.",
            "success"
        );


        document.getElementById(
            "currentScore"
        ).textContent =
            totalScore;


        document.getElementById(
            "attemptStatus"
        ).textContent =
            "Reviewed";


    } catch (error) {

        console.error(
            "Save review error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to save review."
        );


    } finally {

        saveReviewBtn.disabled = false;

        saveReviewBtn.textContent =
            "Save Review";

    }
}


// ========================================
// INITIALIZE
// ========================================

async function initialize() {

    if (!attemptId) {
        return;
    }


    const teacher =
        await checkTeacher();


    if (!teacher) {
        return;
    }


    try {

        const data =
            await loadAttempt();


        renderPage(data);


        loading.style.display =
            "none";


        reviewContent.style.display =
            "block";


    } catch (error) {

        console.error(
            "Initialization error:",
            error
        );


        loading.style.display =
            "none";


        showMessage(
            error.message ||
            "Unable to load submission."
        );

    }
}


// ========================================
// SAVE BUTTON
// ========================================

saveReviewBtn.addEventListener(
    "click",
    saveReview
);


// ========================================
// START
// ========================================

initialize();