// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER TEST QUESTION BUILDER
// ========================================

// ========================================
// ELEMENTS
// ========================================

const questionForm =
    document.getElementById("questionForm");

const questionType =
    document.getElementById("questionType");

const multipleChoiceSection =
    document.getElementById("multipleChoiceSection");

const trueFalseSection =
    document.getElementById("trueFalseSection");

const textAnswerSection =
    document.getElementById("textAnswerSection");

const questionsContainer =
    document.getElementById("questionsContainer");

const questionCount =
    document.getElementById("questionCount");

const messageBox =
    document.getElementById("message");

const addQuestionBtn =
    document.getElementById("addQuestionBtn");

// ========================================
// TEST ID
// ========================================

const urlParams =
    new URLSearchParams(window.location.search);

const testId =
    urlParams.get("id");

// ========================================
// DATA
// ========================================

let currentTest = null;
let questions = [];

// ========================================
// SHOW MESSAGE
// ========================================

function showMessage(message, type) {

    if (!messageBox) return;

    messageBox.innerHTML = `
        <div class="${type}-message">
            ${escapeHtml(message)}
        </div>
    `;

}

// ========================================
// INITIALIZE
// ========================================

async function initializePage() {

    console.log(
        "Teacher Test Questions page started."
    );

    console.log(
        "Test ID:",
        testId
    );

    // ========================================
    // CHECK TEST ID
    // ========================================

    if (!testId) {

        document.getElementById(
            "testTitle"
        ).textContent =
            "Test ID Missing";

        document.getElementById(
            "testDescription"
        ).textContent =
            "No test ID was found.";

        questionsContainer.innerHTML = `
            <div class="empty-state">
                No test ID was found in the page URL.
            </div>
        `;

        showMessage(
            "No Test ID was found in the URL.",
            "error"
        );

        return;
    }

    // ========================================
    // AUTHENTICATION
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

        showMessage(
            "Unable to verify your login session.",
            "error"
        );

        return;
    }

    if (!user) {

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
            .select("id, auth_id, role")
            .eq("auth_id", user.id)
            .eq("role", "teacher")
            .maybeSingle();

    if (teacherError) {

        console.error(
            "Teacher verification error:",
            teacherError
        );

        showMessage(
            "Unable to verify teacher account.",
            "error"
        );

        return;
    }

    if (!teacher) {

        showMessage(
            "You are not authorized to manage tests.",
            "error"
        );

        return;
    }

    // ========================================
    // LOAD DATA
    // ========================================

    await loadTest();

    await loadQuestions();

}

// ========================================
// LOAD TEST
// ========================================

async function loadTest() {

    const {
        data: test,
        error
    } =
        await supabaseClient
            .from("Tests")
            .select(`
                id,
                title,
                description,
                level,
                duration_minutes,
                published,
                subject_id,
                Subjects (
                    name
                )
            `)
            .eq("id", testId)
            .maybeSingle();

    if (error) {

        console.error(
            "Test loading error:",
            error
        );

        showMessage(
            "Unable to load the test. " +
            error.message,
            "error"
        );

        return;
    }

    if (!test) {

        showMessage(
            "The selected test could not be found.",
            "error"
        );

        return;
    }

    currentTest = test;

    // ========================================
    // DISPLAY TEST
    // ========================================

    const titleElement =
        document.getElementById("testTitle");

    const descriptionElement =
        document.getElementById("testDescription");

    const subjectElement =
        document.getElementById("testSubject");

    const levelElement =
        document.getElementById("testLevel");

    const durationElement =
        document.getElementById("testDuration");

    if (titleElement) {
        titleElement.textContent =
            test.title;
    }

    if (descriptionElement) {
        descriptionElement.textContent =
            test.description ||
            "No instructions provided.";
    }

    if (subjectElement) {
        subjectElement.textContent =
            test.Subjects?.name ||
            "Unknown Subject";
    }

    if (levelElement) {
        levelElement.textContent =
            test.level || "—";
    }

    if (durationElement) {
        durationElement.textContent =
            test.duration_minutes
                ? `${test.duration_minutes} minutes`
                : "—";
    }

}

// ========================================
// LOAD QUESTIONS
// ========================================

async function loadQuestions() {

    questionsContainer.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading questions...</p>
        </div>
    `;

    const {
        data,
        error
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
            .eq("test_id", testId)
            .order("question_order", {
                ascending: true
            });

    if (error) {

        console.error(
            "Question loading error:",
            error
        );

        showMessage(
            "Unable to load questions. " +
            error.message,
            "error"
        );

        questionsContainer.innerHTML = `
            <div class="empty-state">
                Unable to load questions.
            </div>
        `;

        return;
    }

    questions = data || [];

    renderQuestions();

}

// ========================================
// RENDER QUESTIONS
// ========================================

function renderQuestions() {

    questionCount.textContent =
        questions.length;

    if (!questions.length) {

        questionsContainer.innerHTML = `
            <div class="empty-state">
                No questions have been added yet.
                <br><br>
                Use the Question Builder above
                to add your first question.
            </div>
        `;

        return;
    }

    questionsContainer.innerHTML =
        questions.map(
            (question, index) => {

                let typeLabel =
                    "Multiple Choice";

                if (
                    question.question_type ===
                    "true_false"
                ) {
                    typeLabel =
                        "True / False";
                }

                if (
                    question.question_type ===
                    "short_answer"
                ) {
                    typeLabel =
                        "Short Answer";
                }

                if (
                    question.question_type ===
                    "essay"
                ) {
                    typeLabel =
                        "Essay";
                }

                return `
                    <div class="question-card">

                        <div class="question-top">

                            <div>

                                <div class="question-number">
                                    QUESTION ${index + 1}
                                </div>

                                <div class="question-text">
                                    ${escapeHtml(
                                        question.question_text
                                    )}
                                </div>

                            </div>

                            <button
                                type="button"
                                class="delete-question-btn"
                                onclick="deleteQuestion(${question.id})"
                            >
                                Delete
                            </button>

                        </div>

                        <div class="question-meta">

                            <span class="question-badge">
                                ${typeLabel}
                            </span>

                            <span class="question-badge">
                                ${question.marks || 1}
                                ${
                                    Number(question.marks) === 1
                                        ? " Mark"
                                        : " Marks"
                                }
                            </span>

                        </div>

                    </div>
                `;

            }
        ).join("");

}

// ========================================
// QUESTION TYPE SWITCHING
// ========================================

function updateQuestionTypeUI() {

    const type =
        questionType.value;

    // Hide everything first

    multipleChoiceSection.style.display =
        "none";

    trueFalseSection.style.display =
        "none";

    textAnswerSection.style.display =
        "none";

    // Multiple Choice

    if (
        type === "multiple_choice"
    ) {

        multipleChoiceSection.style.display =
            "block";

    }

    // True / False

    else if (
        type === "true_false"
    ) {

        trueFalseSection.style.display =
            "block";

    }

    // Short Answer / Essay

    else if (
        type === "short_answer" ||
        type === "essay"
    ) {

        textAnswerSection.style.display =
            "block";

    }

}

questionType.addEventListener(
    "change",
    updateQuestionTypeUI
);

// ========================================
// ADD QUESTION
// ========================================

questionForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        // ========================================
        // BASIC VALIDATION
        // ========================================

        if (!testId) {

            showMessage(
                "Test ID is missing.",
                "error"
            );

            return;
        }

        const questionText =
            document
                .getElementById("questionText")
                .value
                .trim();

        const type =
            questionType.value;

        const marks =
            Number(
                document
                    .getElementById("marks")
                    .value
            );

        if (!questionText) {

            showMessage(
                "Please enter the question.",
                "error"
            );

            return;
        }

        if (!marks || marks < 1) {

            showMessage(
                "Please enter valid marks.",
                "error"
            );

            return;
        }

        // ========================================
        // ANSWER DATA
        // ========================================

        let options = null;
        let correctAnswer = null;

        // ========================================
        // MULTIPLE CHOICE
        // ========================================

        if (
            type === "multiple_choice"
        ) {

            const optionA =
                document
                    .getElementById("optionA")
                    .value
                    .trim();

            const optionB =
                document
                    .getElementById("optionB")
                    .value
                    .trim();

            const optionC =
                document
                    .getElementById("optionC")
                    .value
                    .trim();

            const optionD =
                document
                    .getElementById("optionD")
                    .value
                    .trim();

            if (
                !optionA ||
                !optionB ||
                !optionC ||
                !optionD
            ) {

                showMessage(
                    "Please enter all four answer options.",
                    "error"
                );

                return;
            }

            options = {
                A: optionA,
                B: optionB,
                C: optionC,
                D: optionD
            };

            const selectedAnswer =
                document.querySelector(
                    'input[name="correctAnswer"]:checked'
                );

            if (!selectedAnswer) {

                showMessage(
                    "Please select the correct answer.",
                    "error"
                );

                return;
            }

            correctAnswer =
                selectedAnswer.value;

        }

        // ========================================
        // TRUE / FALSE
        // ========================================

        else if (
            type === "true_false"
        ) {

            const trueFalseElement =
                document.getElementById(
                    "trueFalseAnswer"
                );

            if (!trueFalseElement) {

                showMessage(
                    "True / False answer field was not found.",
                    "error"
                );

                return;
            }

            correctAnswer =
                trueFalseElement.value;

            if (!correctAnswer) {

                showMessage(
                    "Please select True or False.",
                    "error"
                );

                return;
            }

        }

        // ========================================
        // SHORT ANSWER
        // ========================================

        else if (
            type === "short_answer"
        ) {

            const textAnswer =
                document.getElementById(
                    "correctTextAnswer"
                );

            if (!textAnswer) {

                showMessage(
                    "Expected answer field was not found.",
                    "error"
                );

                return;
            }

            correctAnswer =
                textAnswer.value.trim();

            if (!correctAnswer) {

                showMessage(
                    "Please enter the expected answer.",
                    "error"
                );

                return;
            }

        }

        // ========================================
        // ESSAY
        // ========================================

        else if (
            type === "essay"
        ) {

            /*
             * Essay questions do not require
             * an exact correct answer.
             *
             * The teacher can review and grade
             * the student's response manually.
             */

            const textAnswer =
                document.getElementById(
                    "correctTextAnswer"
                );

            if (
                textAnswer &&
                textAnswer.value.trim()
            ) {

                correctAnswer =
                    textAnswer.value.trim();

            } else {

                correctAnswer = null;

            }

        }

        // ========================================
        // QUESTION ORDER
        // ========================================

        const nextOrder =
            questions.length + 1;

        // ========================================
        // DISABLE BUTTON
        // ========================================

        addQuestionBtn.disabled =
            true;

        addQuestionBtn.textContent =
            "Adding Question...";

        // ========================================
        // INSERT
        // ========================================

        const {
            data: newQuestion,
            error
        } =
            await supabaseClient
                .from("Test_Questions")
                .insert([{

                    test_id:
                        Number(testId),

                    question_text:
                        questionText,

                    question_type:
                        type,

                    options:
                        options,

                    correct_answer:
                        correctAnswer,

                    marks:
                        marks,

                    question_order:
                        nextOrder

                }])
                .select()
                .single();

        // ========================================
        // ERROR
        // ========================================

        if (error) {

            console.error(
                "Add question error:",
                error
            );

            showMessage(
                "Unable to add question. " +
                error.message,
                "error"
            );

            addQuestionBtn.disabled =
                false;

            addQuestionBtn.textContent =
                "+ Add Question";

            return;
        }

        console.log(
            "Question added:",
            newQuestion
        );

        // ========================================
        // SUCCESS
        // ========================================

        showMessage(
            "Question added successfully.",
            "success"
        );

        // ========================================
        // RESET FORM
        // ========================================

        questionForm.reset();

        questionType.value =
            "multiple_choice";

        updateQuestionTypeUI();

        // ========================================
        // RESET CORRECT ANSWER
        // ========================================

        const defaultCorrectAnswer =
            document.querySelector(
                'input[name="correctAnswer"][value="A"]'
            );

        if (defaultCorrectAnswer) {

            defaultCorrectAnswer.checked =
                true;

        }

        // ========================================
        // RELOAD QUESTIONS
        // ========================================

        await loadQuestions();

        // ========================================
        // ENABLE BUTTON
        // ========================================

        addQuestionBtn.disabled =
            false;

        addQuestionBtn.textContent =
            "+ Add Question";

    }
);

// ========================================
// DELETE QUESTION
// ========================================

async function deleteQuestion(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this question?"
        );

    if (!confirmed) {
        return;
    }

    const {
        error
    } =
        await supabaseClient
            .from("Test_Questions")
            .delete()
            .eq("id", id);

    if (error) {

        console.error(
            "Delete question error:",
            error
        );

        showMessage(
            "Unable to delete question. " +
            error.message,
            "error"
        );

        return;
    }

    showMessage(
        "Question deleted successfully.",
        "success"
    );

    await loadQuestions();

}

// ========================================
// ESCAPE HTML
// ========================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

// ========================================
// START
// ========================================

updateQuestionTypeUI();

initializePage();