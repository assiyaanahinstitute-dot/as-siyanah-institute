// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER PORTAL - RESULTS LIST
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
// GET LOGGED-IN TEACHER
// ========================================

async function getCurrentTeacher() {

    const {
        data: { session },
        error: sessionError
    } = await supabaseClient.auth.getSession();


    if (sessionError) {

        console.error(
            "Session error:",
            sessionError
        );

        throw new Error(
            "Unable to verify your login."
        );
    }


    if (!session) {

        window.location.href =
            "teacher-login.html";

        throw new Error(
            "Teacher is not logged in."
        );
    }


    const {
        data: teacher,
        error: teacherError
    } = await supabaseClient
        .from("Teachers")
        .select(`
            id,
            auth_id,
            full_name,
            role
        `)
        .eq(
            "auth_id",
            session.user.id
        )
        .eq(
            "role",
            "teacher"
        )
        .maybeSingle();


    if (teacherError) {

        console.error(
            "Teacher lookup error:",
            teacherError
        );

        throw new Error(
            "Unable to verify teacher account."
        );
    }


    if (!teacher) {

        await supabaseClient.auth.signOut();

        window.location.href =
            "teacher-login.html";

        throw new Error(
            "Teacher account not found."
        );
    }


    return teacher;
}


// ========================================
// LOAD RESULTS
// ========================================

async function loadTeacherResults() {

    const resultsList =
        document.getElementById(
            "teacherResultsList"
        );

    const totalResults =
        document.getElementById(
            "totalResults"
        );

    const studentCount =
        document.getElementById(
            "resultStudentCount"
        );


    try {

        console.log(
            "Loading teacher results..."
        );


        // ==================================
        // GET CURRENT TEACHER
        // ==================================

        const teacher =
            await getCurrentTeacher();


        console.log(
            "Current teacher:",
            teacher.full_name,
            "Teacher ID:",
            teacher.id
        );


        // ==================================
        // GET ONLY THIS TEACHER'S RESULTS
        // ==================================

        const {
            data: results,
            error
        } = await supabaseClient
            .from("Results")
            .select(`
                student_id,
                subject,
                test_score,
                exam_score,
                total_score,
                grade,
                term,
                session
            `)
            .eq(
                "teacher_id",
                teacher.id
            )
            .order("student_id", {
                ascending: true
            });


        if (error) {

            console.error(
                "Unable to load results:",
                error
            );

            resultsList.innerHTML = `
                <div style="
                    text-align:center;
                    padding:40px;
                    background:#fff;
                    border:1px solid #e5e5e5;
                    border-radius:12px;
                ">

                    <h3>
                        Unable to load results
                    </h3>

                    <p>
                        ${error.message}
                    </p>

                </div>
            `;

            return;
        }


        // ==================================
        // STATISTICS
        // ==================================

        totalResults.textContent =
            results?.length ?? 0;


        const uniqueStudents =
            new Set(
                (results || []).map(
                    result => result.student_id
                )
            );


        studentCount.textContent =
            uniqueStudents.size;


        // ==================================
        // NO RESULTS
        // ==================================

        if (
            !results ||
            results.length === 0
        ) {

            resultsList.innerHTML = `
                <div style="
                    text-align:center;
                    padding:40px;
                    background:#fff;
                    border:1px solid #e5e5e5;
                    border-radius:12px;
                ">

                    <h3>
                        No Results Yet
                    </h3>

                    <p>
                        Results you create will appear here.
                    </p>

                </div>
            `;

            return;
        }


        // ==================================
        // CLEAR LOADING MESSAGE
        // ==================================

        resultsList.innerHTML = "";


        // ==================================
        // BUILD RESULT CARDS
        // ==================================

        results.forEach(
            function (result) {

                const card =
                    document.createElement("div");


                card.style.cssText = `
                    background:#fff;
                    border:1px solid #e5e5e5;
                    border-radius:12px;
                    padding:25px;
                    margin-bottom:20px;
                `;


                card.innerHTML = `

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        align-items:flex-start;
                        gap:20px;
                        flex-wrap:wrap;
                    ">

                        <div>

                            <p style="
                                margin:0 0 6px;
                                color:#777;
                                font-size:14px;
                            ">
                                STUDENT ID
                            </p>

                            <h3 style="
                                margin:0;
                                color:#1d5e3c;
                            ">
                                ${result.student_id}
                            </h3>

                        </div>


                        <div style="
                            text-align:right;
                        ">

                            <p style="
                                margin:0 0 6px;
                                color:#777;
                                font-size:14px;
                            ">
                                GRADE
                            </p>

                            <strong style="
                                font-size:28px;
                                color:#1d5e3c;
                            ">
                                ${result.grade || "—"}
                            </strong>

                        </div>

                    </div>


                    <hr style="
                        margin:20px 0;
                        border:0;
                        border-top:1px solid #eee;
                    ">


                    <div style="
                        display:grid;
                        grid-template-columns:
                            repeat(
                                auto-fit,
                                minmax(130px, 1fr)
                            );
                        gap:15px;
                    ">


                        <div>

                            <small>
                                SUBJECT
                            </small>

                            <p style="
                                margin:5px 0 0;
                                font-weight:600;
                            ">
                                ${result.subject || "—"}
                            </p>

                        </div>


                        <div>

                            <small>
                                TEST
                            </small>

                            <p style="
                                margin:5px 0 0;
                                font-weight:600;
                            ">
                                ${result.test_score ?? 0}/40
                            </p>

                        </div>


                        <div>

                            <small>
                                EXAM
                            </small>

                            <p style="
                                margin:5px 0 0;
                                font-weight:600;
                            ">
                                ${result.exam_score ?? 0}/60
                            </p>

                        </div>


                        <div>

                            <small>
                                TOTAL
                            </small>

                            <p style="
                                margin:5px 0 0;
                                font-weight:700;
                                color:#1d5e3c;
                            ">
                                ${result.total_score ?? 0}/100
                            </p>

                        </div>


                        <div>

                            <small>
                                TERM
                            </small>

                            <p style="
                                margin:5px 0 0;
                                font-weight:600;
                            ">
                                ${result.term || "—"}
                            </p>

                        </div>


                        <div>

                            <small>
                                SESSION
                            </small>

                            <p style="
                                margin:5px 0 0;
                                font-weight:600;
                            ">
                                ${result.session || "—"}
                            </p>

                        </div>

                    </div>

                `;


                resultsList.appendChild(
                    card
                );

            }
        );


    } catch (error) {

        console.error(
            "Results list error:",
            error
        );

        resultsList.innerHTML = `
            <div style="
                text-align:center;
                padding:40px;
            ">

                <h3>
                    Something went wrong
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>
        `;
    }
}


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadTeacherResults();

    }
);