// ========================================
// AS-SIYĀNAH INSTITUTE
// TEACHER PORTAL - RESULTS
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
// ELEMENTS
// ========================================

const studentSelect =
    document.getElementById("resultStudent");

const subjectInput =
    document.getElementById("resultSubject");

const testInput =
    document.getElementById("testScore");

const examInput =
    document.getElementById("examScore");

const totalPreview =
    document.getElementById("resultTotalPreview");

const gradePreview =
    document.getElementById("resultGradePreview");

const termSelect =
    document.getElementById("resultTerm");

const sessionInput =
    document.getElementById("resultSession");

const form =
    document.getElementById("teacherResultForm");

const saveButton =
    document.getElementById("saveResultButton");


// ========================================
// LOAD STUDENTS
// ========================================

async function loadStudents() {

    try {

        const {
            data: students,
            error
        } = await supabaseClient
            .from("Student")
            .select(`
                student_id,
                full_name,
                programme,
                level
            `)
            .order("student_id", {
                ascending: true
            });


        if (error) {

            console.error(
                "Unable to load students:",
                error
            );

            studentSelect.innerHTML = `
                <option value="">
                    Unable to load students
                </option>
            `;

            return;
        }


        studentSelect.innerHTML = `
            <option value="">
                Select Student
            </option>
        `;


        students.forEach(function (student) {

            const option =
                document.createElement("option");

            option.value =
                student.student_id;

            option.textContent =
                `${student.student_id} — ${student.full_name}`;

            studentSelect.appendChild(option);

        });


    } catch (error) {

        console.error(
            "Student loading error:",
            error
        );

        studentSelect.innerHTML = `
            <option value="">
                Unable to load students
            </option>
        `;
    }
}


// ========================================
// CALCULATE GRADE
// ========================================

function getGrade(total) {

    if (total >= 80) {
        return "A";
    }

    if (total >= 70) {
        return "B";
    }

    if (total >= 60) {
        return "C";
    }

    if (total >= 50) {
        return "D";
    }

    if (total >= 40) {
        return "E";
    }

    return "F";
}


// ========================================
// UPDATE TOTAL AND GRADE
// ========================================

function updateResultPreview() {

    const test =
        Number(testInput.value) || 0;

    const exam =
        Number(examInput.value) || 0;

    const total =
        test + exam;

    const grade =
        getGrade(total);


    totalPreview.textContent =
        total;

    gradePreview.textContent =
        `Grade: ${grade}`;
}


testInput.addEventListener(
    "input",
    updateResultPreview
);

examInput.addEventListener(
    "input",
    updateResultPreview
);


// ========================================
// SAVE RESULT
// ========================================

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const studentId =
            studentSelect.value;

        const subject =
            subjectInput.value.trim();

        const testScore =
            Number(testInput.value);

        const examScore =
            Number(examInput.value);

        const totalScore =
            testScore + examScore;

        const grade =
            getGrade(totalScore);

        const term =
            termSelect.value;

        const session =
            sessionInput.value.trim();


        // VALIDATION

        if (!studentId) {

            alert(
                "Please select a student."
            );

            return;
        }


        if (!subject) {

            alert(
                "Please enter the subject."
            );

            return;
        }


        if (
            testScore < 0 ||
            testScore > 40
        ) {

            alert(
                "Test score must be between 0 and 40."
            );

            return;
        }


        if (
            examScore < 0 ||
            examScore > 60
        ) {

            alert(
                "Exam score must be between 0 and 60."
            );

            return;
        }


        if (!term) {

            alert(
                "Please select a term."
            );

            return;
        }


        if (!session) {

            alert(
                "Please enter the academic session."
            );

            return;
        }


        saveButton.disabled = true;

        saveButton.textContent =
            "Saving Result...";


        try {

            const {
                data,
                error
            } = await supabaseClient
                .from("Results")
                .insert([
                    {
                        student_id: studentId,
                        subject: subject,
                        test_score: testScore,
                        exam_score: examScore,
                    
                        grade: grade,
                        term: term,
                        session: session
                    }
                ])
                .select();


            if (error) {

                console.error(
                    "Result save error:",
                    error
                );

                alert(
                    "Unable to save result:\n\n" +
                    error.message
                );

                return;
            }


            console.log(
                "Result saved:",
                data
            );


            alert(
                "Result saved successfully!"
            );


            // RESET FORM

            form.reset();

            totalPreview.textContent =
                "0";

            gradePreview.textContent =
                "Grade: —";


        } catch (error) {

            console.error(
                "Unexpected error:",
                error
            );

            alert(
                "Something went wrong while saving the result."
            );

        } finally {

            saveButton.disabled = false;

            saveButton.textContent =
                "Save Result";
        }

    }
);


// ========================================
// START
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadStudents();

    }
);