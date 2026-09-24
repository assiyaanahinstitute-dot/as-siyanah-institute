// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER - ATTENDANCE HISTORY
// ========================================

const SUPABASE_URL =
    "https://ridyfpaqoyegdvqmkiyl.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_dH1z6RuBIqxN88pyG9YfVA_1niXEWIh";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ========================================
// GLOBAL VARIABLES
// ========================================

let currentTeacher = null;
let teacherClasses = [];
let currentAttendanceRecords = [];

let studentMap = new Map();
let classMap = new Map();

let currentEditRecordId = null;


// ========================================
// PAGE LOAD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        setupEventListeners();

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

        await loadTeacher(
            session.user.id
        );

        if (!currentTeacher) {
            return;
        }

        await loadTeacherClasses();

    }
);


// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {

    // Load history
    document
        .getElementById("loadHistoryBtn")
        .addEventListener(
            "click",
            loadAttendanceHistory
        );


    // Clear filters
    document
        .getElementById("clearFiltersBtn")
        .addEventListener(
            "click",
            async function () {

                document.getElementById(
                    "classSelect"
                ).value = "";

                document.getElementById(
                    "dateSelect"
                ).value = "";

                await loadAttendanceHistory();

            }
        );


    // Save edit
    document
        .getElementById("saveEditBtn")
        .addEventListener(
            "click",
            saveAttendanceEdit
        );


    // Close modal
    document
        .getElementById("closeEditModalBtn")
        .addEventListener(
            "click",
            closeEditModal
        );


    document
        .getElementById("cancelEditBtn")
        .addEventListener(
            "click",
            closeEditModal
        );


    // Close modal when clicking outside
    document
        .getElementById("editAttendanceModal")
        .addEventListener(
            "click",
            function (event) {

                if (
                    event.target.id ===
                    "editAttendanceModal"
                ) {

                    closeEditModal();

                }

            }
        );


    // ====================================
    // EDIT BUTTON EVENT DELEGATION
    // ====================================

    document
        .getElementById("historyTableBody")
        .addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        ".edit-attendance-btn"
                    );

                if (!button) {
                    return;
                }

                const recordId =
                    Number(
                        button.dataset.id
                    );

                openEditModal(
                    recordId
                );

            }
        );

}


// ========================================
// LOAD TEACHER
// ========================================

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
        "Current Teacher:",
        currentTeacher
    );

}


// ========================================
// LOAD TEACHER CLASSES
// ========================================

async function loadTeacherClasses() {

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

    teacherClasses =
        data || [];

    classMap.clear();

    teacherClasses.forEach(
        function (classItem) {

            classMap.set(
                Number(classItem.id),
                classItem
            );

        }
    );


    const classSelect =
        document.getElementById(
            "classSelect"
        );

    classSelect.innerHTML =
        `
        <option value="">
            All Classes
        </option>
        `;


    teacherClasses.forEach(
        function (classItem) {

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

}


// ========================================
// LOAD ATTENDANCE HISTORY
// ========================================

async function loadAttendanceHistory() {

    showMessage(
        "Loading attendance records...",
        "info"
    );


    const classId =
        document.getElementById(
            "classSelect"
        ).value;


    const date =
        document.getElementById(
            "dateSelect"
        ).value;


    let classIds =
        teacherClasses.map(
            function (item) {

                return Number(
                    item.id
                );

            }
        );


    if (classId) {

        classIds = [
            Number(classId)
        ];

    }


    if (classIds.length === 0) {

        showMessage(
            "No classes are assigned to you.",
            "error"
        );

        return;
    }


    let attendanceQuery =
        supabaseClient
            .from("Attendance")
            .select(`
                id,
                class_id,
                student_id,
                attendance_date,
                status,
                note,
                marked_by,
                created_at,
                updated_at
            `)
            .in(
                "class_id",
                classIds
            )
            .order(
                "attendance_date",
                {
                    ascending: false
                }
            );


    if (date) {

        attendanceQuery =
            attendanceQuery.eq(
                "attendance_date",
                date
            );

    }


    const {
        data: attendanceRecords,
        error: attendanceError
    } = await attendanceQuery;


    if (attendanceError) {

        console.error(
            "Attendance Error:",
            attendanceError
        );

        showMessage(
            `Unable to load attendance: ${attendanceError.message}`,
            "error"
        );

        return;
    }


    currentAttendanceRecords =
        attendanceRecords || [];


    // ====================================
    // LOAD STUDENTS
    // ====================================

    const studentIds =
        [
            ...new Set(
                currentAttendanceRecords.map(
                    function (record) {

                        return Number(
                            record.student_id
                        );

                    }
                )
            )
        ];


    studentMap.clear();


    if (studentIds.length > 0) {

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
            );


        if (studentsError) {

            console.error(
                "Students Error:",
                studentsError
            );

            showMessage(
                "Unable to load student information.",
                "error"
            );

            return;
        }


        (students || []).forEach(
            function (student) {

                studentMap.set(
                    Number(student.id),
                    student
                );

            }
        );

    }


    // ====================================
    // RENDER
    // ====================================

    renderHistory();

    updateStatistics(
        currentAttendanceRecords
    );


    const historyInfo =
        document.getElementById(
            "historyInfo"
        );


    if (date) {

        historyInfo.textContent =
            `Showing attendance for ${formatDate(date)}`;

    } else {

        historyInfo.textContent =
            `Showing ${currentAttendanceRecords.length} attendance record(s)`;

    }


    if (
        currentAttendanceRecords.length === 0
    ) {

        showMessage(
            "No attendance records found.",
            "info"
        );

    } else {

        showMessage(
            `${currentAttendanceRecords.length} attendance record(s) loaded.`,
            "success"
        );

    }

}


// ========================================
// RENDER HISTORY
// ========================================

function renderHistory() {

    const tbody =
        document.getElementById(
            "historyTableBody"
        );


    tbody.innerHTML = "";


    if (
        currentAttendanceRecords.length === 0
    ) {

        tbody.innerHTML =
            `
            <tr>

                <td
                    colspan="8"
                    style="
                        text-align:center;
                        padding:40px;
                        color:#718078;
                    "
                >
                    No attendance records found.
                </td>

            </tr>
            `;

        return;
    }


    currentAttendanceRecords.forEach(
        function (record, index) {

            const student =
                studentMap.get(
                    Number(
                        record.student_id
                    )
                );


            const classItem =
                classMap.get(
                    Number(
                        record.class_id
                    )
                );


            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML =
                `
                <td>
                    ${index + 1}
                </td>

                <td>
                    ${formatDate(
                        record.attendance_date
                    )}
                </td>

                <td>
                    ${escapeHtml(
                        classItem
                            ? classItem.class_name
                            : "Unknown Class"
                    )}
                </td>

                <td>
                    <strong>
                        ${escapeHtml(
                            student
                                ? student.full_name
                                : "Unknown Student"
                        )}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(
                        student
                            ? (
                                student.student_id ||
                                "—"
                            )
                            : "—"
                    )}
                </td>

                <td>
                    <span
                        class="attendance-badge ${getStatusClass(
                            record.status
                        )}"
                    >
                        ${escapeHtml(
                            record.status
                        )}
                    </span>
                </td>

                <td>
                    ${escapeHtml(
                        record.note || "—"
                    )}
                </td>

                <td>

                    <button
                        type="button"
                        class="btn btn-secondary edit-attendance-btn"
                        data-id="${record.id}"
                    >
                        Edit
                    </button>

                </td>
                `;


            tbody.appendChild(
                row
            );

        }
    );

}


// ========================================
// OPEN EDIT MODAL
// ========================================

function openEditModal(recordId) {

    console.log(
        "Opening attendance record:",
        recordId
    );


    const record =
        currentAttendanceRecords.find(
            function (item) {

                return Number(item.id) ===
                    Number(recordId);

            }
        );


    if (!record) {

        showMessage(
            "Attendance record could not be found.",
            "error"
        );

        return;
    }


    currentEditRecordId =
        Number(record.id);


    const student =
        studentMap.get(
            Number(
                record.student_id
            )
        );


    const classItem =
        classMap.get(
            Number(
                record.class_id
            )
        );


    const studentName =
        student
            ? student.full_name
            : "Unknown Student";


    const className =
        classItem
            ? classItem.class_name
            : "Unknown Class";


    document.getElementById(
        "editStudentInfo"
    ).textContent =
        `${studentName} • ${className} • ${formatDate(record.attendance_date)}`;


    document.getElementById(
        "editStatus"
    ).value =
        record.status;


    document.getElementById(
        "editNote"
    ).value =
        record.note || "";


    document.getElementById(
        "editAttendanceModal"
    ).style.display =
        "flex";

}


// ========================================
// CLOSE EDIT MODAL
// ========================================

function closeEditModal() {

    currentEditRecordId =
        null;


    document.getElementById(
        "editAttendanceModal"
    ).style.display =
        "none";

}


// ========================================
// SAVE EDIT
// ========================================

async function saveAttendanceEdit() {

    if (!currentEditRecordId) {

        showMessage(
            "No attendance record selected.",
            "error"
        );

        return;
    }


    const status =
        document.getElementById(
            "editStatus"
        ).value;


    const note =
        document.getElementById(
            "editNote"
        ).value.trim();


    const saveButton =
        document.getElementById(
            "saveEditBtn"
        );


    saveButton.disabled =
        true;


    saveButton.textContent =
        "Saving...";


    const {
        error
    } = await supabaseClient
        .from("Attendance")
        .update({

            status: status,

            note:
                note || null,

            updated_at:
                new Date().toISOString()

        })
        .eq(
            "id",
            currentEditRecordId
        );


    if (error) {

        console.error(
            "Update Attendance Error:",
            error
        );


        saveButton.disabled =
            false;


        saveButton.textContent =
            "Save Changes";


        showMessage(
            `Unable to update attendance: ${error.message}`,
            "error"
        );


        return;
    }


    closeEditModal();


    saveButton.disabled =
        false;


    saveButton.textContent =
        "Save Changes";


    showMessage(
        "Attendance updated successfully.",
        "success"
    );


    await loadAttendanceHistory();

}


// ========================================
// STATISTICS
// ========================================

function updateStatistics(records) {

    const total =
        records.length;


    const present =
        records.filter(
            record =>
                record.status ===
                "Present"
        ).length;


    const late =
        records.filter(
            record =>
                record.status ===
                "Late"
        ).length;


    const absent =
        records.filter(
            record =>
                record.status ===
                "Absent"
        ).length;


    document.getElementById(
        "totalCount"
    ).textContent =
        total;


    document.getElementById(
        "presentCount"
    ).textContent =
        present;


    document.getElementById(
        "lateCount"
    ).textContent =
        late;


    document.getElementById(
        "absentCount"
    ).textContent =
        absent;

}


// ========================================
// STATUS CLASS
// ========================================

function getStatusClass(status) {

    if (
        status === "Present"
    ) {

        return "attendance-present";

    }


    if (
        status === "Late"
    ) {

        return "attendance-late";

    }


    if (
        status === "Absent"
    ) {

        return "attendance-absent";

    }


    return "";

}


// ========================================
// FORMAT DATE
// ========================================

function formatDate(dateString) {

    if (!dateString) {
        return "—";
    }


    const date =
        new Date(
            dateString +
            "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-NG",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
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
// SHOW MESSAGE
// ========================================

function showMessage(
    message,
    type = "info"
) {

    const element =
        document.getElementById(
            "historyMessage"
        );


    element.textContent =
        message;


    element.className =
        `message ${type}`;


    element.style.display =
        "block";

}