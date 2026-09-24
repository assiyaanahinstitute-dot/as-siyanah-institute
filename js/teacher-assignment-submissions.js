// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER PORTAL - ASSIGNMENT SUBMISSIONS
// CLASS-AWARE VERSION
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const container =
            document.getElementById(
                "submissionsContainer"
            );

        try {

            // ================================
            // CHECK LOGIN
            // ================================

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

                window.location.href =
                    "teacher-login.html";

                return;
            }


            if (!user) {

                window.location.href =
                    "teacher-login.html";

                return;
            }



            // ================================
            // VERIFY TEACHER
            // ================================

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
                    .eq(
                        "auth_id",
                        user.id
                    )
                    .eq(
                        "role",
                        "teacher"
                    )
                    .single();


            if (teacherError) {

                console.error(
                    "Teacher verification error:",
                    teacherError
                );

                throw teacherError;
            }


            if (!teacher) {

                window.location.href =
                    "teacher-login.html";

                return;
            }


            console.log(
                "Teacher ID:",
                teacher.id
            );

            console.log(
                "Teacher name:",
                teacher.full_name
            );



            // ================================
            // LOAD TEACHER CLASSES
            // ================================

            const {
                data: classes,
                error: classesError
            } =
                await supabaseClient
                    .from("Teacher_Classes")
                    .select(`
                        id,
                        class_name,
                        level,
                        subject_id
                    `)
                    .eq(
                        "teacher_id",
                        teacher.id
                    );


            // DEBUG INFORMATION
            console.log(
                "Teacher Classes:",
                classes
            );

            console.log(
                "Class Error:",
                classesError
            );


            if (classesError) {

                throw classesError;
            }


            const teacherClasses =
                classes || [];



            // ================================
            // NO CLASSES
            // ================================

            if (
                teacherClasses.length === 0
            ) {

                container.innerHTML = `

                    <div class="submissions-empty">

                        <div class="empty-icon">
                            👨‍🏫
                        </div>

                        <h3>
                            No classes assigned
                        </h3>

                        <p>
                            No classes are currently
                            assigned to this teacher.
                        </p>

                    </div>

                `;

                return;
            }



            // ================================
            // CLASS IDS
            // ================================

            const classIds =
                teacherClasses.map(
                    classItem =>
                        classItem.id
                );


            console.log(
                "Teacher Class IDs:",
                classIds
            );



            // ================================
            // LOAD ASSIGNMENTS
            // ================================

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
                        subject_id,
                        level,
                        deadline,
                        published,
                        class_id,
                        created_at
                    `)
                    .in(
                        "class_id",
                        classIds
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


            // DEBUG INFORMATION
            console.log(
                "Teacher Assignments:",
                assignments
            );

            console.log(
                "Assignment Error:",
                assignmentsError
            );


            if (assignmentsError) {

                throw assignmentsError;
            }


            const teacherAssignments =
                assignments || [];



            // ================================
            // NO ASSIGNMENTS
            // ================================

            if (
                teacherAssignments.length === 0
            ) {

                container.innerHTML = `

                    <div class="submissions-empty">

                        <div class="empty-icon">
                            📚
                        </div>

                        <h3>
                            No assignments yet
                        </h3>

                        <p>
                            There are currently no
                            assignments for your classes.
                        </p>

                    </div>

                `;

                return;
            }



            // ================================
            // ASSIGNMENT IDS
            // ================================

            const assignmentIds =
                teacherAssignments.map(
                    assignment =>
                        assignment.id
                );


            console.log(
                "Assignment IDs:",
                assignmentIds
            );



            // ================================
            // LOAD SUBMISSIONS
            // ================================

            const {
                data: submissions,
                error: submissionsError
            } =
                await supabaseClient
                    .from(
                        "Assignment_Submissions"
                    )
                    .select(`
                        id,
                        assignment_id,
                        student_id,
                        file_url,
                        student_message,
                        submitted_at,
                        status,
                        score,
                        teacher_feedback
                    `)
                    .in(
                        "assignment_id",
                        assignmentIds
                    )
                    .order(
                        "submitted_at",
                        {
                            ascending: false
                        }
                    );


            console.log(
                "Assignment Submissions:",
                submissions
            );

            console.log(
                "Submission Error:",
                submissionsError
            );


            if (submissionsError) {

                throw submissionsError;
            }


            const safeSubmissions =
                submissions || [];



            // ================================
            // NO SUBMISSIONS
            // ================================

            if (
                safeSubmissions.length === 0
            ) {

                container.innerHTML = `

                    <div class="submissions-empty">

                        <div class="empty-icon">
                            📚
                        </div>

                        <h3>
                            No submissions yet
                        </h3>

                        <p>
                            Students have not submitted
                            any assignments yet.
                        </p>

                    </div>

                `;

                return;
            }



            // ================================
            // GET STUDENT IDS
            // ================================

            const studentIds = [
                ...new Set(
                    safeSubmissions.map(
                        submission =>
                            submission.student_id
                    )
                )
            ];


            console.log(
                "Student IDs:",
                studentIds
            );



            // ================================
            // LOAD STUDENTS
            // ================================

            const {
                data: students,
                error: studentsError
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
                    .in(
                        "id",
                        studentIds
                    );


            console.log(
                "Students:",
                students
            );

            console.log(
                "Student Error:",
                studentsError
            );


            if (studentsError) {

                throw studentsError;
            }



            // ================================
            // CREATE STUDENT MAP
            // ================================

            const studentMap = {};


            (students || []).forEach(
                student => {

                    studentMap[
                        student.id
                    ] = student;

                }
            );



            // ================================
            // CREATE ASSIGNMENT MAP
            // ================================

            const assignmentMap = {};


            teacherAssignments.forEach(
                assignment => {

                    assignmentMap[
                        assignment.id
                    ] = assignment;

                }
            );



            // ================================
            // CREATE CLASS MAP
            // ================================

            const classMap = {};


            teacherClasses.forEach(
                classItem => {

                    classMap[
                        classItem.id
                    ] = classItem;

                }
            );



            // ================================
            // RENDER SUBMISSIONS
            // ================================

            container.innerHTML =
                safeSubmissions.map(
                    submission => {

                        const student =
                            studentMap[
                                submission.student_id
                            ];


                        const assignment =
                            assignmentMap[
                                submission.assignment_id
                            ];


                        const classItem =
                            assignment
                                ? classMap[
                                    assignment.class_id
                                ]
                                : null;


                        const studentName =
                            student?.full_name ||
                            "Unknown Student";


                        const studentId =
                            student?.student_id ||
                            "N/A";


                        const studentEmail =
                            student?.email ||
                            "No email";


                        const assignmentTitle =
                            assignment?.title ||
                            "Unknown Assignment";


                        const className =
                            classItem?.class_name ||
                            "Unknown Class";


                        const level =
                            assignment?.level ||
                            classItem?.level ||
                            "N/A";


                        const submittedDate =
                            submission.submitted_at
                                ? new Date(
                                    submission.submitted_at
                                ).toLocaleString(
                                    "en-GB",
                                    {
                                        day:
                                            "numeric",
                                        month:
                                            "long",
                                        year:
                                            "numeric",
                                        hour:
                                            "numeric",
                                        minute:
                                            "2-digit"
                                    }
                                )
                                : "Unknown date";


                        const status =
                            submission.status ||
                            "Submitted";


                        const score =
                            submission.score !==
                                null &&
                            submission.score !==
                                undefined
                                ? `${submission.score}`
                                : "Not graded";


                        return `

                            <article
                                class="submission-card"
                            >

                                <div
                                    class="submission-top"
                                >

                                    <div>

                                        <span
                                            class="submission-label"
                                        >
                                            Assignment
                                        </span>

                                        <h2
                                            class="submission-title"
                                        >
                                            ${escapeHtml(
                                                assignmentTitle
                                            )}
                                        </h2>

                                    </div>


                                    <span
                                        class="submission-status"
                                    >
                                        ${escapeHtml(
                                            status
                                        )}
                                    </span>

                                </div>



                                <div
                                    class="submission-details"
                                >

                                    <div
                                        class="submission-detail"
                                    >

                                        <span
                                            class="detail-label"
                                        >
                                            Class
                                        </span>

                                        <strong>
                                            ${escapeHtml(
                                                className
                                            )}
                                        </strong>

                                    </div>


                                    <div
                                        class="submission-detail"
                                    >

                                        <span
                                            class="detail-label"
                                        >
                                            Student
                                        </span>

                                        <strong>
                                            ${escapeHtml(
                                                studentName
                                            )}
                                        </strong>

                                    </div>


                                    <div
                                        class="submission-detail"
                                    >

                                        <span
                                            class="detail-label"
                                        >
                                            Student ID
                                        </span>

                                        <strong>
                                            ${escapeHtml(
                                                studentId
                                            )}
                                        </strong>

                                    </div>


                                    <div
                                        class="submission-detail"
                                    >

                                        <span
                                            class="detail-label"
                                        >
                                            Email
                                        </span>

                                        <strong>
                                            ${escapeHtml(
                                                studentEmail
                                            )}
                                        </strong>

                                    </div>


                                    <div
                                        class="submission-detail"
                                    >

                                        <span
                                            class="detail-label"
                                        >
                                            Level
                                        </span>

                                        <strong>
                                            ${escapeHtml(
                                                level
                                            )}
                                        </strong>

                                    </div>


                                    <div
                                        class="submission-detail"
                                    >

                                        <span
                                            class="detail-label"
                                        >
                                            Submitted
                                        </span>

                                        <strong>
                                            ${escapeHtml(
                                                submittedDate
                                            )}
                                        </strong>

                                    </div>


                                    <div
                                        class="submission-detail"
                                    >

                                        <span
                                            class="detail-label"
                                        >
                                            Score
                                        </span>

                                        <strong>
                                            ${escapeHtml(
                                                score
                                            )}
                                        </strong>

                                    </div>

                                </div>



                                ${
                                    submission.student_message
                                        ? `

                                            <div
                                                class="submission-message"
                                            >

                                                <span>
                                                    Student Message
                                                </span>

                                                <p>
                                                    ${escapeHtml(
                                                        submission.student_message
                                                    )}
                                                </p>

                                            </div>

                                        `
                                        : ""
                                }



                                <div
                                    class="submission-score"
                                >

                                    <div>

                                        <span>
                                            Current Score
                                        </span>

                                        <strong>
                                            ${escapeHtml(
                                                score
                                            )}
                                        </strong>

                                    </div>

                                </div>



                                <button
                                    class="review-submission-btn"
                                    onclick="
                                        viewSubmission(
                                            ${submission.id}
                                        )
                                    "
                                >
                                    Review Submission
                                </button>

                            </article>

                        `;

                    }
                ).join("");


        } catch (error) {

            console.error(
                "Assignment submissions error:",
                error
            );


            container.innerHTML = `

                <div
                    class="submissions-empty"
                >

                    <div class="empty-icon">
                        ⚠️
                    </div>

                    <h3>
                        Unable to load submissions
                    </h3>

                    <p>
                        ${escapeHtml(
                            error.message ||
                            "Please refresh the page and try again."
                        )}
                    </p>

                </div>

            `;

        }

    }
);



// ========================================
// OPEN SUBMISSION
// ========================================

function viewSubmission(
    submissionId
) {

    window.location.href =
        "teacher-assignment-review.html?id=" +
        encodeURIComponent(
            submissionId
        );

}



// ========================================
// ESCAPE HTML
// ========================================

function escapeHtml(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}