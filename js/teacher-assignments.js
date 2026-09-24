// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER ASSIGNMENTS MANAGEMENT
// CLASS-AWARE VERSION
// ========================================


// ========================================
// CHECK TEACHER
// ========================================

async function checkTeacher() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();


    if (error || !user) {

        window.location.href =
            "teacher-login.html";

        return null;
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
            email,
            role
        `)
        .eq("auth_id", user.id)
        .eq("role", "teacher")
        .single();


    if (teacherError || !teacher) {

        alert(
            "You are not authorized to access the teacher portal."
        );

        await supabaseClient.auth.signOut();

        window.location.href =
            "teacher-login.html";

        return null;
    }


    return teacher;
}



// ========================================
// LOAD TEACHER CLASSES
// ========================================

async function loadTeacherClasses(teacherId) {

    const {
        data: classes,
        error
    } = await supabaseClient
        .from("Teacher_Classes")
        .select(`
            id,
            class_name,
            level,
            subject_id
        `)
        .eq("teacher_id", teacherId);


    if (error) {

        console.error(
            "Teacher classes loading error:",
            error
        );

        return [];
    }


    return classes || [];
}



// ========================================
// LOAD ASSIGNMENTS
// ========================================

async function loadAssignments(teacherId) {

    const container =
        document.getElementById(
            "assignmentsContainer"
        );


    // ========================================
    // LOAD TEACHER CLASSES
    // ========================================

    const classes =
        await loadTeacherClasses(
            teacherId
        );


    // ========================================
    // NO CLASSES
    // ========================================

    if (!classes.length) {

        document.getElementById(
            "totalAssignments"
        ).textContent = "0";


        document.getElementById(
            "publishedAssignments"
        ).textContent = "0";


        document.getElementById(
            "draftAssignments"
        ).textContent = "0";


        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    👨‍🏫
                </div>

                <h3>
                    No classes assigned
                </h3>

                <p>
                    You have not been assigned any classes yet.
                </p>

            </div>

        `;

        return;
    }



    // ========================================
    // CLASS IDS
    // ========================================

    const classIds =
        classes.map(
            classItem =>
                classItem.id
        );



    // ========================================
    // LOAD ONLY THIS TEACHER'S ASSIGNMENTS
    // ========================================

    const {
        data: assignments,
        error
    } = await supabaseClient
        .from("Assignments")
        .select(`
            id,
            title,
            description,
            class_id,
            subject_id,
            level,
            deadline,
            published,
            created_at
        `)
        .in(
            "class_id",
            classIds
        )
        .order("created_at", {
            ascending: false
        });


    if (error) {

        console.error(
            "Assignment loading error:",
            error
        );

        container.innerHTML = `
            <div class="error-state">
                Unable to load assignments.
                ${escapeHtml(error.message)}
            </div>
        `;

        return;
    }


    const safeAssignments =
        assignments || [];



    // ========================================
    // STATISTICS
    // ========================================

    const total =
        safeAssignments.length;


    const published =
        safeAssignments.filter(
            assignment =>
                assignment.published === true
        ).length;


    const drafts =
        total - published;


    document.getElementById(
        "totalAssignments"
    ).textContent = total;


    document.getElementById(
        "publishedAssignments"
    ).textContent = published;


    document.getElementById(
        "draftAssignments"
    ).textContent = drafts;



    // ========================================
    // EMPTY STATE
    // ========================================

    if (!safeAssignments.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📝
                </div>

                <h3>
                    No assignments yet
                </h3>

                <p>
                    Create your first assignment
                    for your assigned class.
                </p>

                <a
                    href="teacher-create-assignment.html"
                    class="create-btn"
                >
                    + Create Assignment
                </a>

            </div>

        `;

        return;
    }



    // ========================================
    // LOAD SUBJECTS
    // ========================================

    const subjectIds =
        safeAssignments
            .map(
                assignment =>
                    assignment.subject_id
            )
            .filter(
                id =>
                    id !== null &&
                    id !== undefined
            );


    let subjects = [];


    if (subjectIds.length) {

        const {
            data,
            error: subjectError
        } = await supabaseClient
            .from("Subjects")
            .select(`
                id,
                name
            `)
            .in(
                "id",
                subjectIds
            );


        if (subjectError) {

            console.error(
                "Subject loading error:",
                subjectError
            );

        } else {

            subjects =
                data || [];

        }

    }



    // ========================================
    // RENDER ASSIGNMENTS
    // ========================================

    container.innerHTML = "";


    safeAssignments.forEach(
        assignment => {

            // Find class

            const classItem =
                classes.find(
                    item =>
                        item.id ===
                        assignment.class_id
                );


            const className =
                classItem
                    ? classItem.class_name
                    : "Unknown Class";


            // Find subject

            const subject =
                subjects.find(
                    item =>
                        item.id ===
                        assignment.subject_id
                );


            const subjectName =
                subject
                    ? subject.name
                    : "General";


            // Status

            const status =
                assignment.published
                    ? "Published"
                    : "Draft";


            const statusClass =
                assignment.published
                    ? "published"
                    : "draft";


            // Deadline

            const deadline =
                assignment.deadline
                    ? formatDate(
                        assignment.deadline
                    )
                    : "No deadline";


            // Description

            const description =
                assignment.description
                    ? truncateText(
                        assignment.description,
                        130
                    )
                    : "No instructions provided.";


            // Create card

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "assignment-card";


            card.innerHTML = `

                <div class="assignment-card-top">

                    <h3 class="assignment-title">
                        ${escapeHtml(
                            assignment.title
                        )}
                    </h3>

                    <span
                        class="
                            assignment-status
                            ${statusClass}
                        "
                    >
                        ${status}
                    </span>

                </div>


                <p class="assignment-description">
                    ${escapeHtml(
                        description
                    )}
                </p>


                <div class="assignment-details">


                    <div class="assignment-detail">

                        <span>
                            Class
                        </span>

                        <strong>
                            ${escapeHtml(
                                className
                            )}
                        </strong>

                    </div>


                    <div class="assignment-detail">

                        <span>
                            Subject
                        </span>

                        <strong>
                            ${escapeHtml(
                                subjectName
                            )}
                        </strong>

                    </div>


                    <div class="assignment-detail">

                        <span>
                            Level
                        </span>

                        <strong>
                            ${escapeHtml(
                                formatLevel(
                                    assignment.level
                                )
                            )}
                        </strong>

                    </div>


                    <div class="assignment-detail">

                        <span>
                            Deadline
                        </span>

                        <strong>
                            ${escapeHtml(
                                deadline
                            )}
                        </strong>

                    </div>


                    <div class="assignment-detail">

                        <span>
                            Created
                        </span>

                        <strong>
                            ${escapeHtml(
                                formatDate(
                                    assignment.created_at
                                )
                            )}
                        </strong>

                    </div>

                </div>


                <div class="assignment-actions">


                    <a
                        href="teacher-assignment-submissions.html"
                        class="assignment-action primary"
                    >
                        📋 Submissions
                    </a>


                    <button
                        type="button"
                        class="assignment-action"
                        onclick="
                            editAssignment(
                                ${assignment.id}
                            )
                        "
                    >
                        ✏️ Edit
                    </button>


                    <button
                        type="button"
                        class="
                            assignment-action
                            danger
                        "
                        onclick="
                            deleteAssignment(
                                ${assignment.id}
                            )
                        "
                    >
                        🗑️ Delete
                    </button>


                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}



// ========================================
// EDIT ASSIGNMENT
// ========================================

function editAssignment(id) {

    window.location.href =
        "teacher-edit-assignment.html?id=" +
        encodeURIComponent(id);

}



// ========================================
// DELETE ASSIGNMENT
// ========================================

async function deleteAssignment(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this assignment?"
        );


    if (!confirmed) {
        return;
    }


    const {
        error
    } = await supabaseClient
        .from("Assignments")
        .delete()
        .eq("id", id);


    if (error) {

        console.error(
            "Delete assignment error:",
            error
        );

        alert(
            "Unable to delete assignment.\n\n" +
            error.message
        );

        return;
    }


    alert(
        "Assignment deleted successfully."
    );


    const teacher =
        await checkTeacher();


    if (teacher) {

        await loadAssignments(
            teacher.id
        );

    }

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


    return date.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}



// ========================================
// FORMAT LEVEL
// ========================================

function formatLevel(level) {

    if (!level) {
        return "—";
    }


    return level
        .replace(
            /[-_]/g,
            " "
        )
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}



// ========================================
// TRUNCATE TEXT
// ========================================

function truncateText(
    text,
    maxLength
) {

    if (
        text.length <=
        maxLength
    ) {

        return text;

    }


    return (
        text.substring(
            0,
            maxLength
        ) + "..."
    );

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



// ========================================
// INITIALIZE
// ========================================

async function initializePage() {

    const teacher =
        await checkTeacher();


    if (!teacher) {
        return;
    }


    await loadAssignments(
        teacher.id
    );

}


initializePage();