// ========================================
// AS-SIYĀNAH INSTITUTE
// STUDENT - ATTENDANCE
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

let currentStudent = null;
let attendanceRecords = [];


// ========================================
// PAGE LOAD
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const {
            data: {
                session
            }
        } = await supabaseClient.auth.getSession();


        if (!session) {

            window.location.href =
                "login.html";

            return;
        }


        await loadStudent(
            session.user.id
        );


        if (!currentStudent) {
            return;
        }


        await loadAttendance();

    }
);


// ========================================
// LOAD STUDENT
// ========================================

async function loadStudent(authId) {

    const {
        data,
        error
    } = await supabaseClient
        .from("Student")
        .select(`
            id,
            student_id,
            full_name,
            email,
            auth_id,
            level,
            programme
        `)
        .eq(
            "auth_id",
            authId
        )
        .single();


    if (error) {

        console.error(
            "Student Error:",
            error
        );


        showMessage(
            "Unable to load your student information.",
            "error"
        );


        return;
    }


    currentStudent = data;


    console.log(
        "Current Student:",
        currentStudent
    );

}


// ========================================
// LOAD ATTENDANCE
// ========================================

async function loadAttendance() {

    showMessage(
        "Loading your attendance...",
        "info"
    );


    const {
        data: records,
        error
    } = await supabaseClient
        .from("Attendance")
        .select(`
            id,
            class_id,
            student_id,
            attendance_date,
            status,
            note
        `)
        .eq(
            "student_id",
            currentStudent.id
        )
        .order(
            "attendance_date",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Attendance Error:",
            error
        );


        showMessage(
            `Unable to load attendance: ${error.message}`,
            "error"
        );


        return;
    }


    attendanceRecords =
        records || [];


    console.log(
        "Attendance Records:",
        attendanceRecords
    );


    // ====================================
    // LOAD CLASSES
    // ====================================

    const classIds =
        [
            ...new Set(
                attendanceRecords.map(
                    function (record) {

                        return Number(
                            record.class_id
                        );

                    }
                )
            )
        ];


    const classMap =
        new Map();


    if (classIds.length > 0) {

        const {
            data: classes,
            error: classesError
        } = await supabaseClient
            .from("Teacher_Classes")
            .select(`
                id,
                class_name,
                level
            `)
            .in(
                "id",
                classIds
            );


        if (classesError) {

            console.error(
                "Classes Error:",
                classesError
            );


            showMessage(
                "Unable to load class information.",
                "error"
            );


            return;
        }


        (classes || []).forEach(
            function (classItem) {

                classMap.set(
                    Number(classItem.id),
                    classItem
                );

            }
        );

    }


    // ====================================
    // UPDATE STATISTICS
    // ====================================

    updateStatistics(
        attendanceRecords
    );


    // ====================================
    // RENDER HISTORY
    // ====================================

    renderAttendance(
        attendanceRecords,
        classMap
    );


    const info =
        document.getElementById(
            "attendanceInfo"
        );


    info.textContent =
        `Showing ${attendanceRecords.length} attendance record(s)`;


    if (attendanceRecords.length === 0) {

        showMessage(
            "No attendance records have been recorded yet.",
            "info"
        );

    } else {

        showMessage(
            "Attendance loaded successfully.",
            "success"
        );

    }

}


// ========================================
// UPDATE STATISTICS
// ========================================

function updateStatistics(records) {

    const total =
        records.length;


    const present =
        records.filter(
            function (record) {

                return record.status ===
                    "Present";

            }
        ).length;


    const late =
        records.filter(
            function (record) {

                return record.status ===
                    "Late";

            }
        ).length;


    const absent =
        records.filter(
            function (record) {

                return record.status ===
                    "Absent";

            }
        ).length;


    // ------------------------------------
    // ATTENDANCE RATE
    // ------------------------------------

    let percentage = 0;


    if (total > 0) {

        percentage =
            (
                (present + late) /
                total
            ) * 100;

    }


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


    document.getElementById(
        "attendancePercentage"
    ).textContent =
        `${percentage.toFixed(1)}%`;

}


// ========================================
// RENDER ATTENDANCE
// ========================================

function renderAttendance(
    records,
    classMap
) {

    const tbody =
        document.getElementById(
            "attendanceTableBody"
        );


    tbody.innerHTML = "";


    if (records.length === 0) {

        tbody.innerHTML =
            `
            <tr>

                <td
                    colspan="5"
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


    records.forEach(
        function (record, index) {

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

                `;


            tbody.appendChild(
                row
            );

        }
    );

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
// MESSAGE
// ========================================

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