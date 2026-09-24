// ========================================
// AS-SIYĀNAH INSTITUTE
// ADMIN TEST / EXAM DETAILS
// ========================================

const SUPABASE_URL =
    "https://ridyfpaqoyegdvqmkiyl.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_dH1z6RuBIqxN88pyG9YfVA_1niXEWIh";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ========================================
// GET TEST ID
// ========================================

const params = new URLSearchParams(
    window.location.search
);

const testId = params.get("id");

const assessmentDetails =
    document.getElementById("assessmentDetails");

const questionsContainer =
    document.getElementById("questionsContainer");

const message =
    document.getElementById("message");


// ========================================
// START
// ========================================

if (!testId) {

    message.innerHTML = `
        <div class="error">
            Assessment ID was not found.
        </div>
    `;

    questionsContainer.innerHTML = "";

} else {

    loadAssessment();
}


// ========================================
// LOAD ASSESSMENT
// ========================================

async function loadAssessment() {

    try {

        const { data: test, error } =
            await supabaseClient
                .from("Tests")
                .select(`
                    id,
                    title,
                    description,
                    subject_id,
                    level,
                    duration_minutes,
                    published,
                    assessment_type,
                    created_at,
                    updated_at
                `)
                .eq("id", testId)
                .single();


        if (error) {
            throw error;
        }


        // ========================================
        // LOAD SUBJECT
        // ========================================

        let subjectName = "Unknown Subject";

        if (test.subject_id) {

            const { data: subject } =
                await supabaseClient
                    .from("Subjects")
                    .select("name")
                    .eq("id", test.subject_id)
                    .maybeSingle();

            if (subject) {
                subjectName = subject.name;
            }
        }


        // ========================================
        // BADGES
        // ========================================

        const type =
            test.assessment_type || "Test";

        const typeClass =
            type === "Exam"
                ? "exam-badge"
                : "test-badge";

        const statusClass =
            test.published
                ? "published"
                : "draft";

        const statusText =
            test.published
                ? "Published"
                : "Draft";


        // ========================================
        // DISPLAY ASSESSMENT
        // ========================================

        assessmentDetails.innerHTML = `

            <div class="assessment-card">

                <div class="assessment-title">
                    ${escapeHTML(test.title)}
                </div>

                <div class="assessment-description">
                    ${
                        test.description
                            ? escapeHTML(test.description)
                            : "No description provided."
                    }
                </div>

                <div style="margin-bottom:20px;">

                    <span class="badge ${typeClass}">
                        ${escapeHTML(type)}
                    </span>

                    <span class="badge ${statusClass}">
                        ${statusText}
                    </span>

                </div>

                <div class="info-grid">

                    <div class="info-box">
                        <small>Subject</small>
                        <strong>
                            ${escapeHTML(subjectName)}
                        </strong>
                    </div>

                    <div class="info-box">
                        <small>Level</small>
                        <strong>
                            ${escapeHTML(
                                test.level || "Not specified"
                            )}
                        </strong>
                    </div>

                    <div class="info-box">
                        <small>Duration</small>
                        <strong>
                            ${test.duration_minutes || 0}
                            minutes
                        </strong>
                    </div>

                    <div class="info-box">
                        <small>Created</small>
                        <strong>
                            ${formatDate(test.created_at)}
                        </strong>
                    </div>

                </div>

            </div>
        `;


        // ========================================
        // LOAD QUESTIONS
        // ========================================

        await loadQuestions();

    } catch (error) {

        console.error(error);

        message.innerHTML = `
            <div class="error">
                Failed to load assessment.
                ${escapeHTML(
                    error.message || ""
                )}
            </div>
        `;

        questionsContainer.innerHTML = "";
    }
}


// ========================================
// LOAD QUESTIONS
// ========================================

async function loadQuestions() {

    const { data: questions, error } =
        await supabaseClient
            .from("Test_Questions")
            .select(`
                id,
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

        console.error(error);

        questionsContainer.innerHTML = `
            <div class="error">
                Failed to load questions.
                ${escapeHTML(
                    error.message || ""
                )}
            </div>
        `;

        return;
    }


    // ========================================
    // NO QUESTIONS
    // ========================================

    if (!questions || questions.length === 0) {

        questionsContainer.innerHTML = `
            <div class="empty">
                No questions have been added
                to this assessment yet.
            </div>
        `;

        return;
    }


    // ========================================
    // DISPLAY QUESTIONS
    // ========================================

    questionsContainer.innerHTML =
        questions.map((item, index) => {

            let optionsHTML = "";

            let options = item.options;


            // ========================================
            // PARSE OPTIONS
            // ========================================

            if (typeof options === "string") {

                try {

                    options = JSON.parse(options);

                } catch {

                    options = [];
                }
            }


            // ========================================
            // ARRAY OPTIONS
            // ========================================

            if (Array.isArray(options)) {

                optionsHTML =
                    options.map(option => {

                        const isCorrect =
                            String(option) ===
                            String(item.correct_answer);

                        return `
                            <div class="option ${
                                isCorrect
                                    ? "correct-answer"
                                    : ""
                            }">

                                ${escapeHTML(
                                    String(option)
                                )}

                                ${
                                    isCorrect
                                        ? " ✓ Correct answer"
                                        : ""
                                }

                            </div>
                        `;

                    }).join("");
            }


            // ========================================
            // OBJECT OPTIONS
            // ========================================

            else if (
                options &&
                typeof options === "object"
            ) {

                optionsHTML =
                    Object.entries(options)
                    .map(([key, value]) => {

                        const isCorrect =
                            String(value) ===
                            String(item.correct_answer);

                        return `
                            <div class="option ${
                                isCorrect
                                    ? "correct-answer"
                                    : ""
                            }">

                                <strong>
                                    ${escapeHTML(key)}.
                                </strong>

                                ${escapeHTML(
                                    String(value)
                                )}

                                ${
                                    isCorrect
                                        ? " ✓ Correct answer"
                                        : ""
                                }

                            </div>
                        `;

                    }).join("");
            }


            // ========================================
            // QUESTION CARD
            // ========================================

            return `

                <div class="question-card">

                    <div class="question-number">
                        Question ${index + 1}
                    </div>

                    <div class="question-text">
                        ${escapeHTML(
                            item.question_text
                        )}
                    </div>

                    <div style="margin-bottom:12px;">

                        <span class="badge test-badge">
                            ${escapeHTML(
                                item.question_type ||
                                "Question"
                            )}
                        </span>

                        <span
                            style="
                                margin-left:10px;
                                color:#777;
                            "
                        >
                            ${item.marks || 0}
                            mark(s)
                        </span>

                    </div>

                    ${
                        optionsHTML
                            ? `
                                <div>
                                    ${optionsHTML}
                                </div>
                              `
                            : ""
                    }

                    ${
                        item.correct_answer
                            ? `
                                <div
                                    style="
                                        margin-top:15px;
                                        padding:12px;
                                        background:#f7f8f9;
                                        border-radius:10px;
                                    "
                                >

                                    <strong>
                                        Correct Answer:
                                    </strong>

                                    ${escapeHTML(
                                        String(
                                            item.correct_answer
                                        )
                                    )}

                                </div>
                            `
                            : ""
                    }

                </div>

            `;

        }).join("");
}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(date) {

    if (!date) {
        return "—";
    }

    return new Date(date).toLocaleDateString(
        "en-NG",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );
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