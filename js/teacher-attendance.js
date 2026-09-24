// ============================================
// AS-SIYĀNAH INSTITUTE
// TEACHER ATTENDANCE SYSTEM
// ============================================

const SUPABASE_URL =
    "https://ridyfpaqoyegdvqmkiyl.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_dH1z6RuBIqxN88pyG9YfVA_1niXEWIh";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ============================================
// GLOBAL VARIABLES
// ============================================

let currentTeacher = null;
let teacherClasses = [];
let currentStudents = [];

let selectedClassId = null;
let selectedDate = null;


// ============================================
// PAGE LOAD
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        // Set today's date
        document.getElementById(
            "attendanceDate"
        ).value = getTodayDate();


        // Check teacher login
        const {
            data: {
                session
            }
        } = await supabaseClient.auth.getSession();


        if (!session) {

            window.location.href =
                "teacher-login.html";

            return;
        }


        // Load teacher
        await loadTeacher(session.user.id);


        // Load teacher's classes
        await loadTeacherClasses();

    }
);


// ============================================
// GET TODAY'S DATE
// ============================================

function getTodayDate() {

    const today = new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ============================================
// LOAD TEACHER
// ============================================

async function loadTeacher(authId) {

    const {
        data,
        error
    } = await supabaseClient

        .from("Teachers")

        .select(`
            id,
            auth_id,
            full_name,
            email,
            role
        `)

        .eq(
            "auth_id",
            authId
        )

        .eq(
            "role",
            "teacher"
        )

        .single();


    if (error) {

        console.error(
            "Teacher Error:",
            error
        );

        showMessage(
            "Unable to load teacher information.",
            "error"
        );

        return;
    }


    currentTeacher = data;

    console.log(
        "Teacher:",
        currentTeacher
    );
}


// ============================================
// LOAD TEACHER CLASSES
// ============================================

async function loadTeacherClasses() {

    if (!currentTeacher) {
        return;
    }


    const {
        data,
        error
    } = await supabaseClient

        .from("Teacher_Classes")

        .select(`
            id,
            class_name,
            level,
            subject_id
        `)

        .eq(
            "teacher_id",
            currentTeacher.id
        )

        .order(
            "class_name",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Classes Error:",
            error
        );

        showMessage(
            "Unable to load your classes.",
            "error"
        );

        return;
    }


    teacherClasses = data || [];


    const classSelect =
        document.getElementById(
            "classSelect"
        );


    classSelect.innerHTML =
        `<option value="">
            Select a class
        </option>`;


    teacherClasses.forEach(
        (classItem) => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                classItem.id;

            option.textContent =
                `${classItem.class_name} — ${classItem.level}`;

            classSelect.appendChild(
                option
            );

        }
    );


    console.log(
        "Teacher Classes:",
        teacherClasses
    );
}


// ============================================
// LOAD STUDENTS
// ============================================

document
    .getElementById(
        "loadStudentsBtn"
    )
    .addEventListener(
        "click",
        async () => {

            const classId =
                document.getElementById(
                    "classSelect"
                ).value;


            const date =
                document.getElementById(
                    "attendanceDate"
                ).value;


            if (!classId) {

                showMessage(
                    "Please select a class.",
                    "error"
                );

                return;
            }


            if (!date) {

                showMessage(
                    "Please select a date.",
                    "error"
                );

                return;
            }


            selectedClassId =
                Number(classId);

            selectedDate =
                date;


            await loadStudents();

        }
    );


// ============================================
// LOAD STUDENTS FROM CLASS
// ============================================

async function loadStudents() {

    showMessage(
        "Loading students...",
        "info"
    );


    // ----------------------------------------
    // Get students assigned to the class
    // ----------------------------------------

    const {
        data: classStudents,
        error: classStudentsError
    } = await supabaseClient

        .from("Class_Students")

        .select(`
            student_id
        `)

        .eq(
            "class_id",
            selectedClassId
        );


    if (classStudentsError) {

        console.error(
            "Class Students Error:",
            classStudentsError
        );

        showMessage(
            "Unable to load class students.",
            "error"
        );

        return;
    }


    if (
        !classStudents ||
        classStudents.length === 0
    ) {

        showMessage(
            "No students are assigned to this class.",
            "info"
        );

        document.getElementById(
            "attendanceSection"
        ).style.display = "none";

        return;
    }


    const studentIds =
        classStudents.map(
            item => item.student_id
        );


    // ----------------------------------------
    // Get student information
    // ----------------------------------------

    const {
        data: students,
        error: studentsError
    } = await supabaseClient

        .from("Student")

        .select(`
            id,
            student_id,
            full_name,
            email,
            level
        `)

        .in(
            "id",
            studentIds
        )

        .order(
            "full_name",
            {
                ascending: true
            }
        );


    if (studentsError) {

        console.error(
            "Students Error:",
            studentsError
        );

        showMessage(
            "Unable to load students.",
            "error"
        );

        return;
    }


    currentStudents =
        students || [];


    // ----------------------------------------
    // Load existing attendance
    // ----------------------------------------

    const {
        data: attendanceRecords,
        error: attendanceError
    } = await supabaseClient

        .from("Attendance")

        .select(`
            id,
            student_id,
            status,
            note
        `)

        .eq(
            "class_id",
            selectedClassId
        )

        .eq(
            "attendance_date",
            selectedDate
        );


    if (attendanceError) {

        console.error(
            "Attendance Error:",
            attendanceError
        );

        showMessage(
            "Unable to load attendance records.",
            "error"
        );

        return;
    }


    renderStudents(
        currentStudents,
        attendanceRecords || []
    );


    const selectedClass =
        teacherClasses.find(
            item =>
                item.id ===
                selectedClassId
        );


    document.getElementById(
        "classInfo"
    ).textContent =
        `${selectedClass.class_name} — ${selectedClass.level} — ${formatDate(selectedDate)}`;


    document.getElementById(
        "attendanceSection"
    ).style.display = "block";


    showMessage(
        `${currentStudents.length} student(s) loaded.`,
        "success"
    );

}


// ============================================
// RENDER STUDENTS
// ============================================

function renderStudents(
    students,
    attendanceRecords
) {

    const tbody =
        document.getElementById(
            "studentsTableBody"
        );


    tbody.innerHTML = "";


    students.forEach(
        (student, index) => {

            const existing =
                attendanceRecords.find(
                    record =>
                        Number(
                            record.student_id
                        ) ===
                        Number(
                            student.id
                        )
                );


            const status =
                existing
                    ? existing.status
                    : "Present";


            const note =
                existing
                    ? existing.note || ""
                    : "";


            const row =
                document.createElement(
                    "tr"
                );


            row.dataset.studentId =
                student.id;


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td>
                    <strong>
                        ${escapeHtml(
                            student.full_name
                        )}
                    </strong>
                </td>


                <td>
                    ${escapeHtml(
                        student.student_id ||
                        "—"
                    )}
                </td>


                <td>

                    <select
                        class="attendance-status"
                        data-student-id="${student.id}"
                    >

                        <option
                            value="Present"
                            ${status === "Present"
                                ? "selected"
                                : ""}
                        >
                            Present
                        </option>

                        <option
                            value="Absent"
                            ${status === "Absent"
                                ? "selected"
                                : ""}
                        >
                            Absent
                        </option>

                        <option
                            value="Late"
                            ${status === "Late"
                                ? "selected"
                                : ""}
                        >
                            Late
                        </option>

                    </select>

                </td>


                <td>

                    <input
                        type="text"
                        class="attendance-note"
                        data-student-id="${student.id}"
                        value="${escapeAttribute(note)}"
                        placeholder="Optional note"
                    >

                </td>

            `;


            tbody.appendChild(row);

        }
    );
}


// ============================================
// MARK ALL PRESENT
// ============================================

document
    .getElementById(
        "markAllPresentBtn"
    )
    .addEventListener(
        "click",
        () => {

            const selects =
                document.querySelectorAll(
                    ".attendance-status"
                );


            selects.forEach(
                select => {

                    select.value =
                        "Present";

                }
            );

        }
    );


// ============================================
// SAVE ATTENDANCE
// ============================================

document
    .getElementById(
        "saveAttendanceBtn"
    )
    .addEventListener(
        "click",
        async () => {

            if (
                !selectedClassId ||
                !selectedDate
            ) {

                showMessage(
                    "Please select a class and date first.",
                    "error"
                );

                return;
            }


            const {
                data: {
                    user
                }
            } =
                await supabaseClient.auth.getUser();


            if (!user) {

                showMessage(
                    "Your session has expired. Please log in again.",
                    "error"
                );

                return;
            }


            const records =
                [];


            currentStudents.forEach(
                student => {

                    const statusSelect =
                        document.querySelector(
                            `.attendance-status[data-student-id="${student.id}"]`
                        );


                    const noteInput =
                        document.querySelector(
                            `.attendance-note[data-student-id="${student.id}"]`
                        );


                    records.push({

                        class_id:
                            selectedClassId,

                        student_id:
                            student.id,

                        attendance_date:
                            selectedDate,

                        status:
                            statusSelect
                                ? statusSelect.value
                                : "Present",

                        note:
                            noteInput
                                ? noteInput.value.trim() || null
                                : null,

                        marked_by:
                            user.id

                    });

                }
            );


            if (records.length === 0) {

                showMessage(
                    "There are no students to save.",
                    "error"
                );

                return;
            }


            showMessage(
                "Saving attendance...",
                "info"
            );


            // --------------------------------
            // UPSERT ATTENDANCE
            // --------------------------------

            const {
                error
            } = await supabaseClient

                .from("Attendance")

                .upsert(
                    records,
                    {
                        onConflict:
                            "class_id,student_id,attendance_date"
                    }
                );


            if (error) {

                console.error(
                    "Save Attendance Error:",
                    error
                );

                showMessage(
                    `Unable to save attendance: ${error.message}`,
                    "error"
                );

                return;
            }


            showMessage(
                "Attendance saved successfully.",
                "success"
            );


            // Reload records
            await loadStudents();

        }
    );


// ============================================
// FORMAT DATE
// ============================================

function formatDate(dateString) {

    const date =
        new Date(
            dateString + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-NG",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}


// ============================================
// ESCAPE HTML
// ============================================

function escapeHtml(value) {

    if (!value) {
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


// ============================================
// ESCAPE ATTRIBUTE
// ============================================

function escapeAttribute(value) {

    if (!value) {
        return "";
    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );
}


// ============================================
// MESSAGE
// ============================================

function showMessage(
    message,
    type = "info"
) {

    const element =
        document.getElementById(
            "attendanceMessage"
        );


    element.textContent =
        message;


    element.className =
        `message ${type}`;


    element.style.display =
        "block";
}