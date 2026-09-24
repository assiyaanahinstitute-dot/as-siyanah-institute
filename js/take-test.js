// ========================================
// AS-SIYĀNAH INSTITUTE
// STUDENT TAKE TEST / EXAM
// ========================================


// ========================================
// ELEMENTS
// ========================================

const loading =
    document.getElementById("loading");

const testArea =
    document.getElementById("testArea");

const testTitle =
    document.getElementById("testTitle");

const testSubject =
    document.getElementById("testSubject");

const assessmentLabel =
    document.getElementById("assessmentLabel");

const timer =
    document.getElementById("timer");

const questionProgress =
    document.getElementById("questionProgress");

const questionNumber =
    document.getElementById("questionNumber");

const questionMarks =
    document.getElementById("questionMarks");

const questionText =
    document.getElementById("questionText");

const answerArea =
    document.getElementById("answerArea");

const previousButton =
    document.getElementById("previousButton");

const nextButton =
    document.getElementById("nextButton");

const navigationCount =
    document.getElementById("navigationCount");

const questionNumbers =
    document.getElementById("questionNumbers");

const submitButton =
    document.getElementById("submitButton");

const submitButtonText =
    document.getElementById("submitButtonText");

const submitModal =
    document.getElementById("submitModal");

const submitModalTitle =
    document.getElementById("submitModalTitle");

const submitModalMessage =
    document.getElementById("submitModalMessage");

const cancelSubmit =
    document.getElementById("cancelSubmit");

const confirmSubmit =
    document.getElementById("confirmSubmit");

const messageBox =
    document.getElementById("message");


// ========================================
// GET TEST ID
// ========================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const testId =
    urlParams.get("id");


// ========================================
// VARIABLES
// ========================================

let currentUser = null;

let currentStudent = null;

let currentTest = null;

let questions = [];

let currentQuestionIndex = 0;

let answers = {};

let remainingSeconds = 0;

let timerInterval = null;

let submitting = false;

let testStartedAt = null;


// ========================================
// GET ASSESSMENT NAME
// ========================================

function getAssessmentName() {

    if (
        currentTest &&
        currentTest.assessment_type === "Exam"
    ) {

        return "Exam";
    }

    return "Test";
}


// ========================================
// UPDATE ASSESSMENT UI
// ========================================

function updateAssessmentUI() {

    const assessmentName =
        getAssessmentName();

    const lowerName =
        assessmentName.toLowerCase();


    if (assessmentLabel) {

        assessmentLabel.textContent =
            assessmentName === "Exam"
                ? "ONLINE EXAMINATION"
                : "ONLINE TEST";

    }


    if (submitButtonText) {

        submitButtonText.textContent =
            `Submit ${assessmentName}`;

    }


    if (submitModalTitle) {

        submitModalTitle.textContent =
            `Submit ${assessmentName}?`;

    }


    if (submitModalMessage) {

        submitModalMessage.textContent =
            `Are you sure you want to submit your ${lowerName}? You may not be able to change your answers afterwards.`;

    }

}


// ========================================
// MESSAGE
// ========================================

function showMessage(
    message,
    type = "error"
) {

    if (!messageBox) {
        return;
    }


    messageBox.textContent =
        message;


    messageBox.style.display =
        "block";


    if (type === "success") {

        messageBox.style.background =
            "#e7f5ec";

        messageBox.style.color =
            "#176b3c";

    } else {

        messageBox.style.background =
            "#fae8e8";

        messageBox.style.color =
            "#a52d2d";
    }

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(value) {

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
// GET CURRENT USER
// ========================================

async function getCurrentUser() {

    const {
        data: {
            user
        },
        error
    } =
        await supabaseClient.auth.getUser();


    if (
        error ||
        !user
    ) {

        window.location.href =
            "login.html";

        return null;
    }


    currentUser =
        user;


    return user;

}


// ========================================
// GET STUDENT
// ========================================

async function getStudent() {

    const {
        data: student,
        error
    } =
        await supabaseClient
            .from("Student")
            .select(`
                id,
                auth_id,
                full_name,
                level,
                programme
            `)
            .eq(
                "auth_id",
                currentUser.id
            )
            .maybeSingle();


    if (
        error ||
        !student
    ) {

        console.error(
            "Student error:",
            error
        );

        showMessage(
            "Unable to load your student profile."
        );

        return null;
    }


    currentStudent =
        student;


    return student;

}


// ========================================
// LOAD TEST / EXAM
// ========================================

async function loadTest() {

    if (!testId) {

        loading.style.display =
            "none";

        showMessage(
            "No assessment was selected."
        );

        return false;
    }


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
                assessment_type,
                Subjects (
                    name
                )
            `)
            .eq(
                "id",
                testId
            )
            .eq(
                "published",
                true
            )
            .maybeSingle();


    if (error) {

        console.error(
            "Test error:",
            error
        );

        showMessage(
            error.message
        );

        return false;
    }


    if (!test) {

        showMessage(
            "This assessment is not available."
        );

        return false;
    }


    currentTest =
        test;


    // ====================================
    // UPDATE UI
    // ====================================

    updateAssessmentUI();


    const assessmentName =
        getAssessmentName();


    testTitle.textContent =
        test.title ||
        assessmentName;


    testSubject.textContent =
        test.Subjects?.name ||
        "No subject";


    // ====================================
    // PREPARE TIMER
    // ====================================

    if (
        test.duration_minutes &&
        Number(test.duration_minutes) > 0
    ) {

        remainingSeconds =
            Number(
                test.duration_minutes
            ) * 60;

    } else {

        timer.textContent =
            "No limit";

    }


    return true;

}


// ========================================
// LOAD QUESTIONS
// ========================================

async function loadQuestions() {

    const {
        data: testQuestions,
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
            .eq(
                "test_id",
                testId
            )
            .order(
                "question_order",
                {
                    ascending: true
                }
            );


    if (error) {

        console.error(
            "Questions error:",
            error
        );

        showMessage(
            error.message
        );

        return false;
    }


    questions =
        testQuestions || [];


    if (
        questions.length === 0
    ) {

        showMessage(
            `This ${getAssessmentName().toLowerCase()} does not contain any questions yet.`
        );

        return false;
    }


    return true;

}


// ========================================
// RENDER QUESTION
// ========================================

function renderQuestion() {

    const question =
        questions[
            currentQuestionIndex
        ];


    if (!question) {
        return;
    }


    const total =
        questions.length;


    const number =
        currentQuestionIndex + 1;


    questionNumber.textContent =
        `Question ${number}`;


    questionMarks.textContent =
        `${question.marks || 1} ${
            Number(question.marks || 1) === 1
                ? "mark"
                : "marks"
        }`;


    questionText.textContent =
        question.question_text;


    questionProgress.textContent =
        `${number} / ${total}`;


    navigationCount.textContent =
        `${number} of ${total}`;


    renderAnswerArea(
        question
    );


    previousButton.disabled =
        currentQuestionIndex === 0;


    nextButton.disabled =
        currentQuestionIndex ===
        total - 1;


    renderQuestionNumbers();

}


// ========================================
// RENDER ANSWER AREA
// ========================================

function renderAnswerArea(question) {

    const type =
        question.question_type ||
        "multiple_choice";


    const savedAnswer =
        answers[question.id] || "";


    // ====================================
    // MULTIPLE CHOICE
    // ====================================

    if (
        type === "multiple_choice"
    ) {

        let options =
            question.options;


        if (
            typeof options === "string"
        ) {

            try {

                options =
                    JSON.parse(options);

            } catch (error) {

                console.error(
                    "Options JSON error:",
                    error
                );

                options = {};

            }

        }


        if (
            !options ||
            typeof options !== "object"
        ) {

            options = {};

        }


        const letters =
            [
                "A",
                "B",
                "C",
                "D"
            ];


        answerArea.innerHTML =
            letters
                .filter(
                    letter =>
                        options[letter] !== undefined &&
                        options[letter] !== null &&
                        String(
                            options[letter]
                        ).trim() !== ""
                )
                .map(
                    letter => `

                        <label
                            class="answer-option"
                        >

                            <input
                                type="radio"
                                name="answer"
                                value="${escapeHTML(
                                    letter
                                )}"
                                ${
                                    savedAnswer ===
                                    letter
                                        ? "checked"
                                        : ""
                                }
                            >

                            <span>

                                <strong>
                                    ${letter}.
                                </strong>

                                ${escapeHTML(
                                    options[letter]
                                )}

                            </span>

                        </label>

                    `
                )
                .join("");


        answerArea
            .querySelectorAll(
                'input[name="answer"]'
            )
            .forEach(
                input => {

                    input.addEventListener(
                        "change",
                        function () {

                            saveCurrentAnswer(
                                this.value
                            );

                        }
                    );

                }
            );


        return;

    }


    // ====================================
    // TRUE / FALSE
    // ====================================

    if (
        type === "true_false"
    ) {

        const choices =
            [
                "True",
                "False"
            ];


        answerArea.innerHTML =
            choices
                .map(
                    choice => `

                        <label
                            class="answer-option"
                        >

                            <input
                                type="radio"
                                name="answer"
                                value="${choice}"
                                ${
                                    savedAnswer ===
                                    choice
                                        ? "checked"
                                        : ""
                                }
                            >

                            <span>
                                ${choice}
                            </span>

                        </label>

                    `
                )
                .join("");


        answerArea
            .querySelectorAll(
                'input[name="answer"]'
            )
            .forEach(
                input => {

                    input.addEventListener(
                        "change",
                        function () {

                            saveCurrentAnswer(
                                this.value
                            );

                        }
                    );

                }
            );


        return;

    }


    // ====================================
    // SHORT ANSWER / ESSAY
    // ====================================

    answerArea.innerHTML = `

        <textarea
            id="textAnswer"
            class="answer-textarea"
            placeholder="Write your answer here..."
        ></textarea>

    `;


    const textAnswer =
        document.getElementById(
            "textAnswer"
        );


    textAnswer.value =
        savedAnswer;


    textAnswer.addEventListener(
        "input",
        function () {

            saveCurrentAnswer(
                this.value
            );

        }
    );

}


// ========================================
// SAVE CURRENT ANSWER
// ========================================

function saveCurrentAnswer(value) {

    const question =
        questions[
            currentQuestionIndex
        ];


    if (!question) {
        return;
    }


    answers[question.id] =
        value;


    renderQuestionNumbers();

}


// ========================================
// RENDER QUESTION NUMBERS
// ========================================

function renderQuestionNumbers() {

    questionNumbers.innerHTML =
        questions
            .map(
                (question, index) => {

                    const answered =
                        answers[question.id] &&
                        String(
                            answers[question.id]
                        ).trim() !== "";


                    return `

                        <button
                            type="button"
                            class="
                                question-number-btn
                                ${
                                    index ===
                                    currentQuestionIndex
                                        ? "current"
                                        : ""
                                }
                                ${
                                    answered
                                        ? "answered"
                                        : ""
                                }
                            "
                            data-index="${index}"
                        >
                            ${index + 1}
                        </button>

                    `;

                }
            )
            .join("");


    questionNumbers
        .querySelectorAll(
            ".question-number-btn"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    function () {

                        currentQuestionIndex =
                            Number(
                                this.dataset.index
                            );


                        renderQuestion();


                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });

                    }
                );

            }
        );

}


// ========================================
// NEXT BUTTON
// ========================================

nextButton.onclick =
    function () {

        if (
            currentQuestionIndex <
            questions.length - 1
        ) {

            currentQuestionIndex++;


            renderQuestion();


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }

    };


// ========================================
// PREVIOUS BUTTON
// ========================================

previousButton.onclick =
    function () {

        if (
            currentQuestionIndex > 0
        ) {

            currentQuestionIndex--;


            renderQuestion();


            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }

    };


// ========================================
// START TIMER
// ========================================

function startTimer() {

    if (timerInterval) {

        clearInterval(
            timerInterval
        );

    }


    updateTimer();


    timerInterval =
        setInterval(
            function () {

                remainingSeconds--;


                if (
                    remainingSeconds <= 0
                ) {

                    clearInterval(
                        timerInterval
                    );


                    timerInterval =
                        null;


                    remainingSeconds =
                        0;


                    updateTimer();


                    autoSubmit();


                    return;

                }


                updateTimer();

            },
            1000
        );

}


// ========================================
// UPDATE TIMER
// ========================================

function updateTimer() {

    if (!timer) {
        return;
    }


    if (
        remainingSeconds <= 0
    ) {

        timer.textContent =
            "00:00";

        return;

    }


    const minutes =
        Math.floor(
            remainingSeconds / 60
        );


    const seconds =
        remainingSeconds % 60;


    timer.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

}


// ========================================
// SUBMIT MODAL
// ========================================

submitButton.onclick =
    function () {

        if (submitting) {
            return;
        }


        updateAssessmentUI();


        submitModal.classList.add(
            "show"
        );

    };


cancelSubmit.onclick =
    function () {

        if (submitting) {
            return;
        }


        submitModal.classList.remove(
            "show"
        );

    };


confirmSubmit.onclick =
    function () {

        if (submitting) {
            return;
        }


        submitModal.classList.remove(
            "show"
        );


        submitTest();

    };


// ========================================
// AUTO SUBMIT
// ========================================

async function autoSubmit() {

    if (submitting) {
        return;
    }


    const assessmentName =
        getAssessmentName();


    showMessage(
        `Time is up. Submitting your ${assessmentName.toLowerCase()}...`,
        "success"
    );


    await submitTest(
        true
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
        .toLowerCase()
        .replace(
            /\s+/g,
            " "
        );

}


// ========================================
// CALCULATE MARKS
// ========================================

function calculateMarks(question) {

    const studentAnswer =
        answers[question.id];


    const questionMarks =
        Number(
            question.marks || 1
        );


    if (
        studentAnswer === undefined ||
        studentAnswer === null ||
        String(
            studentAnswer
        ).trim() === ""
    ) {

        return 0;

    }


    const type =
        question.question_type ||
        "multiple_choice";


    const correctAnswer =
        question.correct_answer;


    // ====================================
    // MULTIPLE CHOICE
    // ====================================

    if (
        type === "multiple_choice"
    ) {

        if (
            normalizeAnswer(
                studentAnswer
            ) ===
            normalizeAnswer(
                correctAnswer
            )
        ) {

            return questionMarks;

        }


        return 0;

    }


    // ====================================
    // TRUE / FALSE
    // ====================================

    if (
        type === "true_false"
    ) {

        if (
            normalizeAnswer(
                studentAnswer
            ) ===
            normalizeAnswer(
                correctAnswer
            )
        ) {

            return questionMarks;

        }


        return 0;

    }


    // ====================================
    // SHORT ANSWER
    // ====================================

    if (
        type === "short_answer"
    ) {

        if (
            normalizeAnswer(
                studentAnswer
            ) ===
            normalizeAnswer(
                correctAnswer
            )
        ) {

            return questionMarks;

        }


        return 0;

    }


    // ====================================
    // ESSAY
    // ====================================

    if (
        type === "essay"
    ) {

        return 0;

    }


    return 0;

}


// ========================================
// SUBMIT TEST / EXAM
// ========================================

async function submitTest(
    automatic = false
) {

    if (submitting) {
        return;
    }


    submitting = true;


    const assessmentName =
        getAssessmentName();


    const lowerAssessmentName =
        assessmentName.toLowerCase();


    // ====================================
    // STOP TIMER
    // ====================================

    if (timerInterval) {

        clearInterval(
            timerInterval
        );

        timerInterval =
            null;

    }


    // ====================================
    // DISABLE BUTTONS
    // ====================================

    submitButton.disabled =
        true;

    previousButton.disabled =
        true;

    nextButton.disabled =
        true;


    try {

        // ====================================
        // CHECK STUDENT
        // ====================================

        if (!currentStudent) {

            throw new Error(
                "Student profile could not be found."
            );

        }


        // ====================================
        // CHECK TEST
        // ====================================

        if (!currentTest) {

            throw new Error(
                `${assessmentName} information could not be found.`
            );

        }


        // ====================================
        // CHECK EXISTING ATTEMPT
        // ====================================

        const {
            data: existingAttempts,
            error: existingError
        } =
            await supabaseClient
                .from("Test_Attempts")
                .select(`
                    id,
                    test_id,
                    student_id,
                    status
                `)
                .eq(
                    "test_id",
                    Number(testId)
                )
                .eq(
                    "student_id",
                    currentStudent.id
                )
                .limit(1);


        if (existingError) {

            console.error(
                "Existing attempt error:",
                existingError
            );

            throw existingError;

        }


        if (
            existingAttempts &&
            existingAttempts.length > 0
        ) {

            throw new Error(
                `You have already started or submitted this ${lowerAssessmentName}.`
            );

        }


        // ====================================
        // CALCULATE SCORE
        // ====================================

        let totalScore = 0;

        let totalMarks = 0;

        let hasEssay = false;


        questions.forEach(
            question => {

                const marks =
                    Number(
                        question.marks || 1
                    );


                totalMarks +=
                    marks;


                if (
                    question.question_type ===
                    "essay"
                ) {

                    hasEssay = true;

                }


                totalScore +=
                    calculateMarks(
                        question
                    );

            }
        );


        // ====================================
        // TIMES
        // ====================================

        const startedAt =
            testStartedAt ||
            new Date().toISOString();


        const submittedAt =
            new Date().toISOString();


        // ====================================
        // CREATE ATTEMPT
        // ====================================

        const {
            data: attempt,
            error: attemptError
        } =
            await supabaseClient
                .from("Test_Attempts")
                .insert([{

                    test_id:
                        Number(testId),

                    student_id:
                        currentStudent.id,

                    started_at:
                        startedAt,

                    submitted_at:
                        submittedAt,

                    score:
                        totalScore,

                    status:
                        hasEssay
                            ? "Pending Review"
                            : "Submitted"

                }])
                .select()
                .single();


        if (attemptError) {

            console.error(
                "Attempt error:",
                attemptError
            );

            throw attemptError;

        }


        // ====================================
        // SAVE ANSWERS
        // ====================================

        const answerRows =
            questions.map(
                question => {

                    const studentAnswer =
                        answers[question.id] ||
                        "";


                    const marksAwarded =
                        calculateMarks(
                            question
                        );


                    return {

                        attempt_id:
                            attempt.id,

                        question_id:
                            question.id,

                        answer:
                            studentAnswer,

                        marks_awarded:
                            marksAwarded

                    };

                }
            );


        if (
            answerRows.length > 0
        ) {

            const {
                error: answersError
            } =
                await supabaseClient
                    .from("Test_Answers")
                    .insert(
                        answerRows
                    );


            if (answersError) {

                console.error(
                    "Answers error:",
                    answersError
                );


                throw answersError;

            }

        }


        // ====================================
        // CALCULATE PERCENTAGE
        // ====================================

        let percentage = 0;


        if (
            totalMarks > 0
        ) {

            percentage =
                Math.round(
                    (
                        totalScore /
                        totalMarks
                    ) * 100
                );

        }


        // ====================================
        // HIDE TEST AREA
        // ====================================

        testArea.style.display =
            "none";


        // ====================================
        // SUCCESS SCREEN
        // ====================================

        loading.style.display =
            "block";


        loading.innerHTML = `

            <div
                style="
                    max-width:650px;
                    margin:0 auto;
                    text-align:center;
                    padding:35px 20px;
                "
            >

                <div
                    style="
                        width:70px;
                        height:70px;
                        margin:0 auto 20px;
                        border-radius:50%;
                        background:#e7f5ec;
                        color:#176b3c;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-size:40px;
                        font-weight:700;
                    "
                >
                    ✓
                </div>


                <h2>
                    ${assessmentName} Submitted Successfully
                </h2>


                <p>
                    ${
                        automatic
                            ? `Your ${lowerAssessmentName} was automatically submitted because the time expired.`
                            : `Your ${lowerAssessmentName} has been submitted successfully.`
                    }
                </p>


                <div
                    style="
                        margin:25px 0;
                        padding:24px;
                        border-radius:16px;
                        background:#f3f8f5;
                    "
                >

                    <div
                        style="
                            font-size:14px;
                            color:#666;
                            margin-bottom:8px;
                        "
                    >
                        Objective Score
                    </div>


                    <div
                        style="
                            font-size:34px;
                            font-weight:700;
                            color:#176b3c;
                        "
                    >
                        ${totalScore} / ${totalMarks}
                    </div>


                    <div
                        style="
                            margin-top:5px;
                            font-weight:600;
                        "
                    >
                        ${percentage}%
                    </div>

                </div>


                ${
                    hasEssay
                        ? `

                            <div
                                style="
                                    margin:20px 0;
                                    padding:16px;
                                    border-radius:12px;
                                    background:#fff7e6;
                                    color:#795500;
                                "
                            >

                                Your essay answer(s) have been
                                submitted and will be reviewed
                                by your teacher.

                            </div>

                        `
                        : `

                            <p>
                                Your result has been recorded.
                            </p>

                        `
                }


                <br>


                <button
                    type="button"
                    onclick="
                        window.location.href='tests.html'
                    "
                    style="
                        padding:13px 24px;
                        border:none;
                        border-radius:10px;
                        background:#176b3c;
                        color:white;
                        cursor:pointer;
                        font-weight:600;
                        font-size:15px;
                    "
                >
                    Back to Assessments
                </button>

            </div>

        `;


    } catch (error) {

        console.error(
            "SUBMIT TEST ERROR:",
            error
        );


        showMessage(
            error.message ||
            `Unable to submit your ${lowerAssessmentName}.`
        );


        submitting = false;


        submitButton.disabled =
            false;


        previousButton.disabled =
            currentQuestionIndex === 0;


        nextButton.disabled =
            currentQuestionIndex ===
            questions.length - 1;


        if (
            remainingSeconds > 0 &&
            !timerInterval
        ) {

            startTimer();

        }

    }

}


// ========================================
// INITIALIZE
// ========================================

async function initialize() {

    if (!testId) {

        loading.style.display =
            "none";

        showMessage(
            "No assessment was selected."
        );

        return;

    }


    const user =
        await getCurrentUser();


    if (!user) {
        return;
    }


    const student =
        await getStudent();


    if (!student) {
        return;
    }


    const testLoaded =
        await loadTest();


    if (!testLoaded) {

        loading.style.display =
            "none";

        return;

    }


    const questionsLoaded =
        await loadQuestions();


    if (!questionsLoaded) {

        loading.style.display =
            "none";

        return;

    }


    loading.style.display =
        "none";


    testArea.style.display =
        "block";


    testStartedAt =
        new Date().toISOString();


    if (
        currentTest.duration_minutes &&
        Number(
            currentTest.duration_minutes
        ) > 0
    ) {

        startTimer();

    }


    renderQuestion();

}


// ========================================
// START APPLICATION
// ========================================

initialize();