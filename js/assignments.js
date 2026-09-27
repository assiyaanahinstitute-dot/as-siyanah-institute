// ========================================
// AS-SIYĀNAH INSTITUTE
// STUDENT ASSIGNMENTS
// ========================================

document.addEventListener("DOMContentLoaded", async function () {

    const container =
        document.getElementById("assignmentsContainer");

    if (!container) {
        return;
    }


    try {

        // ========================================
        // CHECK LOGGED-IN STUDENT
        // ========================================

        const {
            data: { user },
            error: authError
        } = await supabaseClient.auth.getUser();


        if (authError || !user) {

            window.location.href =
                "login.html";

            return;
        }


        // ========================================
        // GET STUDENT INFORMATION
        // FIRST: AUTH ID
        // FALLBACK: EMAIL
        // ========================================

        let student = null;


        const {
            data: authStudent,
            error: authStudentError
        } =
            await supabaseClient
                .from("Student")
                .select(`
                    id,
                    level,
                    email
                `)
                .eq("auth_id", user.id)
                .maybeSingle();


        if (authStudentError) {

            console.error(
                "Auth ID student lookup error:",
                authStudentError
            );

        } else {

            student = authStudent;

        }


        // ========================================
        // FALLBACK TO EMAIL
        // ========================================

        if (!student && user.email) {

            const {
                data: emailStudent,
                error: emailStudentError
            } =
                await supabaseClient
                    .from("Student")
                    .select(`
                        id,
                        level,
                        email
                    `)
                    .eq("email", user.email)
                    .maybeSingle();


            if (emailStudentError) {

                console.error(
                    "Email student lookup error:",
                    emailStudentError
                );

                throw emailStudentError;

            }


            student = emailStudent;

        }


        // ========================================
        // STUDENT NOT FOUND
        // ========================================

        if (!student) {

            container.innerHTML = `

                <div style="
                    text-align:center;
                    padding:50px 20px;
                    background:#ffffff;
                    border:1px solid #E4EAE6;
                    border-radius:20px;
                ">

                    <div style="
                        font-size:50px;
                        margin-bottom:15px;
                    ">
                        👤
                    </div>

                    <h3>
                        Student profile not found
                    </h3>

                    <p>
                        We could not find your student
                        information. Please contact your teacher.
                    </p>

                </div>

            `;

            return;
        }


        // ========================================
        // GET PUBLISHED ASSIGNMENTS
        // ========================================

        const {
            data: assignments,
            error: assignmentsError
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
                    Subjects (
                        id,
                        name
                    )
                `)
                .eq("published", true)
                .order("created_at", {
                    ascending: false
                });


        if (assignmentsError) {

            throw assignmentsError;

        }


        // ========================================
        // FILTER BY STUDENT LEVEL
        // ========================================

        const studentLevel =
            String(student.level || "")
                .trim()
                .toLowerCase();


        const visibleAssignments =
            (assignments || []).filter(
                function (assignment) {

                    const assignmentLevel =
                        String(
                            assignment.level || ""
                        )
                            .trim()
                            .toLowerCase();


                    return (
                        !assignmentLevel ||
                        assignmentLevel === studentLevel
                    );

                }
            );


        // ========================================
        // NO ASSIGNMENTS
        // ========================================

        if (visibleAssignments.length === 0) {

            container.innerHTML = `

                <div style="
                    text-align:center;
                    padding:60px 20px;
                    background:#ffffff;
                    border:1px solid #E4EAE6;
                    border-radius:20px;
                    box-shadow:0 8px 25px rgba(11,53,36,0.05);
                ">

                    <div style="
                        width:64px;
                        height:64px;
                        margin:0 auto 20px;
                        border-radius:18px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        background:#EAF4EE;
                        font-size:30px;
                    ">
                        📝
                    </div>


                    <h3 style="
                        margin:0 0 10px;
                        color:#0B3524;
                    ">
                        No Assignments Yet
                    </h3>


                    <p style="
                        max-width:480px;
                        margin:0 auto;
                        color:#718078;
                        line-height:1.7;
                    ">
                        Your teacher hasn't posted any
                        assignments for you yet.
                        Please check back when a new
                        assignment is published.
                    </p>

                </div>

            `;

            return;
        }


        // ========================================
        // DISPLAY ASSIGNMENTS
        // ========================================

        let html = "";


        visibleAssignments.forEach(
            function (assignment) {

                const subjectName =
                    assignment.Subjects &&
                    assignment.Subjects.name
                        ? assignment.Subjects.name
                        : "General";


                let deadlineText =
                    "No deadline";


                if (assignment.deadline) {

                    deadlineText =
                        new Date(
                            assignment.deadline
                        ).toLocaleDateString(
                            "en-GB",
                            {
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                            }
                        );

                }


                html += `

                    <article class="announcement-card">

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
                            ${assignment.description || ""}
                        </p>


                        <button
                            type="button"
                            onclick="openAssignment(${assignment.id})"
                        >
                            View Assignment
                        </button>

                    </article>

                `;

            }
        );


        container.innerHTML = html;


    } catch (error) {

        console.error(
            "Assignments error:",
            error
        );


        container.innerHTML = `

            <div style="
                text-align:center;
                padding:50px 20px;
                background:#ffffff;
                border:1px solid #E4EAE6;
                border-radius:20px;
            ">

                <div style="
                    font-size:45px;
                    margin-bottom:15px;
                ">
                    ⚠️
                </div>


                <h3 style="
                    color:#0B3524;
                    margin-bottom:10px;
                ">
                    Unable to load assignments
                </h3>


                <p style="
                    color:#718078;
                ">
                    ${error.message ||
                    "Something went wrong while loading your assignments."}
                </p>

            </div>

        `;

    }

});


// ========================================
// OPEN ASSIGNMENT
// ========================================

function openAssignment(assignmentId) {

    window.location.href =
        "assignment.html?id=" +
        encodeURIComponent(assignmentId);

}