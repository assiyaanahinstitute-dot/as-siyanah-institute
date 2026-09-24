document.addEventListener("DOMContentLoaded", async function () {

    const resultMessage =
        document.getElementById("resultMessage");

    const resultDetails =
        document.getElementById("resultDetails");


    // ========================================
    // CHECK ADMIN LOGIN
    // ========================================

    const { data: sessionData, error: sessionError } =
        await supabaseClient.auth.getSession();

    if (sessionError) {

        console.error(
            "Session error:",
            sessionError
        );

        resultMessage.textContent =
            "Unable to check admin login.";

        return;
    }


    if (!sessionData.session) {

        window.location.href =
            "admin-login.html";

        return;
    }


    // ========================================
    // GET STUDENT ID FROM URL
    // ========================================

    const params =
        new URLSearchParams(
            window.location.search
        );

    const studentId =
        params.get("student_id");


    console.log(
        "Student ID:",
        studentId
    );


    if (!studentId) {

        resultMessage.textContent =
            "Student ID was not provided.";

        return;
    }


    // ========================================
    // LOAD RESULT
    // ========================================

    const { data: results, error } =
        await supabaseClient
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
            .eq("student_id", studentId);


    if (error) {

        console.error(
            "Result loading error:",
            error
        );

        resultMessage.textContent =
            "Unable to load result: " +
            error.message;

        return;
    }


    if (!results || !results.length) {

        resultMessage.textContent =
            "No result found for this student.";

        return;
    }


    // ========================================
    // USE FIRST RESULT
    // ========================================

    const result =
        results[0];


    console.log(
        "Result loaded:",
        result
    );


    // ========================================
    // DISPLAY RESULT
    // ========================================

    document.getElementById(
        "resultStudentName"
    ).textContent =
        "Result Details";


    document.getElementById(
        "resultStudentId"
    ).textContent =
        result.student_id || "N/A";


    document.getElementById(
        "studentId"
    ).textContent =
        result.student_id || "N/A";


    document.getElementById(
        "resultSubject"
    ).textContent =
        result.subject || "N/A";


    document.getElementById(
        "resultTest"
    ).textContent =
        result.test_score ?? "N/A";


    document.getElementById(
        "resultExam"
    ).textContent =
        result.exam_score ?? "N/A";


    document.getElementById(
        "resultTotal"
    ).textContent =
        result.total_score ?? "N/A";


    document.getElementById(
        "resultGrade"
    ).textContent =
        result.grade || "N/A";


    document.getElementById(
        "resultTerm"
    ).textContent =
        result.term || "N/A";


    document.getElementById(
        "resultSession"
    ).textContent =
        result.session || "N/A";


    // ========================================
    // SHOW RESULT
    // ========================================

    resultMessage.style.display =
        "none";


    resultDetails.style.display =
        "block";

});