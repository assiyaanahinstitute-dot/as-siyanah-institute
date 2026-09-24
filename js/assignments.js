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
            window.location.href = "login.html";
            return;
        }


        // ========================================
        // GET STUDENT INFORMATION
        // ========================================

        const {
            data: student,
            error: studentError
        } = await supabaseClient
            .from("Student")
            .select(`
                id,
                level
            `)
            .eq("auth_id", user.id)
            .single();


        if (studentError) {
            throw studentError;
        }


        // ========================================
        // GET PUBLISHED ASSIGNMENTS
        // ========================================

        const {
            data: assignments,
            error: assignmentsError
        } = await supabaseClient
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
            (assignments || []).filter(function (assignment) {

                const assignmentLevel =
                    String(assignment.level || "")
                        .trim()
                        .toLowerCase();

                return (
                    !assignmentLevel ||
                    assignmentLevel === studentLevel
                );

            });


        // ========================================
        // NO ASSIGNMENTS
        // ========================================

        if (visibleAssignments.length === 0) {

            container.innerHTML = `
                <div style="
                    text-align:center;
                    padding:50px 20px;
                ">

                    <div style="font-size:50px;">
                        📝
                    </div>

                    <h3>
                        No Assignments
                    </h3>

                    <p>
                        There are no assignments
                        available for you at the moment.
                    </p>

                </div>
            `;

            return;
        }


        // ========================================
        // DISPLAY ASSIGNMENTS
        // ========================================

        let html = "";


        visibleAssignments.forEach(function (assignment) {

            const subjectName =
                assignment.Subjects &&
                assignment.Subjects.name
                    ? assignment.Subjects.name
                    : "General";


            let deadlineText = "No deadline";


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

        });


        container.innerHTML = html;


    } catch (error) {

        console.error(
            "Assignments error:",
            error
        );

        container.innerHTML = `

            <div style="
                text-align:center;
                padding:40px;
            ">

                <h3>
                    Unable to load assignments
                </h3>

                <p>
                    ${error.message || "Something went wrong."}
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