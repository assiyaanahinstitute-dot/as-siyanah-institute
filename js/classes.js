document.addEventListener("DOMContentLoaded", async function () {

    const subjectsContainer =
        document.getElementById("subjectsContainer");

    if (!subjectsContainer) return;

    try {

        const {
            data: { user },
            error: authError
        } = await supabaseClient.auth.getUser();

        if (authError || !user) {
            window.location.href = "login.html";
            return;
        }


        // Get only classes assigned to the logged-in student
        const {
            data: classes,
            error: classesError
        } = await supabaseClient
            .rpc("get_my_classes");


        if (classesError) {
            throw classesError;
        }


        subjectsContainer.innerHTML = "";


        // No assigned classes
        if (!classes || classes.length === 0) {

            subjectsContainer.innerHTML = `

                <div class="subject-empty">

                    <div class="subject-empty-icon">
                        📚
                    </div>

                    <h3>
                        No Classes Yet
                    </h3>

                    <p>
                        You have not been assigned to any classes yet.
                    </p>

                </div>

            `;

            return;
        }


        // Display assigned classes
        classes.forEach(function (classData) {

            const subjectName =
                classData.subject_name ||
                "General Class";


            const card =
                document.createElement("a");


            card.className =
                "subject-card";


            card.href =
                "subject.html?subject=" +
                encodeURIComponent(subjectName);


            card.innerHTML = `

                <div class="subject-card-icon">
                    📚
                </div>

                <div class="subject-card-content">

                    <span class="subject-category">
                        ${classData.class_name}
                    </span>

                    <h3>
                        ${subjectName}
                    </h3>

                    <small>
                        ${classData.level}
                    </small>

                </div>

                <div class="subject-card-arrow">
                    →
                </div>

            `;


            subjectsContainer.appendChild(card);

        });


    } catch (error) {

        console.error(
            "My Classes error:",
            error
        );


        subjectsContainer.innerHTML = `

            <div class="subject-empty">

                <div class="subject-empty-icon">
                    ⚠️
                </div>

                <h3>
                    Unable to Load Classes
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

});