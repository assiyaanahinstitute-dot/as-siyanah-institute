document.addEventListener(
    "DOMContentLoaded",
    async function () {

        const tableBody =
            document.getElementById(
                "registrationsTableBody"
            );

        const message =
            document.getElementById(
                "registrationsMessage"
            );

        const searchInput =
            document.getElementById(
                "registrationSearch"
            );

        let registrations = [];


        // CHECK ADMIN LOGIN
        const { data: sessionData } =
            await supabaseClient.auth.getSession();

        if (!sessionData.session) {

            window.location.href =
                "admin-login.html";

            return;
        }


        // LOAD REGISTRATIONS
        async function loadRegistrations() {

            message.textContent =
                "Loading registrations...";


            const { data, error } =
                await supabaseClient
                    .from("Student")
                    .select(`
                        id,
                        full_name,
                        gender,
                        country,
                        city,
                        whatsapp,
                        email,
                        programme,
                        level,
                        registration_status
                    `)
                    .order(
                        "id",
                        {
                            ascending: false
                        }
                    );


            if (error) {

                console.error(
                    "Registration loading error:",
                    error
                );

                message.textContent =
                    "Unable to load registrations: " +
                    error.message;

                return;
            }


            registrations =
                data || [];


            message.textContent =
                registrations.length +
                " registration(s) found.";


            displayRegistrations(
                registrations
            );
        }


        // DISPLAY REGISTRATIONS
        function displayRegistrations(
            list
        ) {

            tableBody.innerHTML = "";


            if (!list.length) {

                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7">
                            No registrations found.
                        </td>
                    </tr>
                `;

                return;
            }


            list.forEach(
                function (registration) {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `
                        <td>
                            ${
                                registration.full_name ||
                                "N/A"
                            }
                        </td>

                        <td>
                            ${
                                registration.gender ||
                                "N/A"
                            }
                        </td>

                        <td>
                            ${
                                registration.programme ||
                                "N/A"
                            }
                        </td>

                        <td>
                            ${
                                registration.level ||
                                "N/A"
                            }
                        </td>

                        <td>
                            ${
                                registration.email ||
                                "N/A"
                            }
                        </td>

                    

                        <td>
                             ${
                                  registration.whatsapp ||
                                  "N/A"
                            }
                       </td>

                        <td>
                              ${
        registration.registration_status ||
        "Pending"
    }
</td>

<td>

    <button
                        <td>

                            <button
                                type="button"
                                class="registration-view-button"
                                data-id="${
                                    registration.id
                                }"
                            >
                                View
                            </button>

                        </td>
                    `;


                    tableBody.appendChild(
                        row
                    );

                }
            );
        }


        // SEARCH
        searchInput.addEventListener(
            "input",
            function () {

                const search =
                    searchInput.value
                        .toLowerCase()
                        .trim();


                const filtered =
                    registrations.filter(
                        function (
                            registration
                        ) {

                            return (

                                (
                                    registration.full_name ||
                                    ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        search
                                    )

                                ||

                                (
                                    registration.email ||
                                    ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        search
                                    )

                                ||

                                (
                                    registration.programme ||
                                    ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        search
                                    )

                                ||

                                (
                                    registration.level ||
                                    ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        search
                                    )

                                ||

                                (
                                    registration.whatsapp ||
                                    ""
                                )
                                    .toLowerCase()
                                    .includes(
                                        search
                                    )

                            );
                        }
                    );


                displayRegistrations(
                    filtered
                );

            }
        );


        // VIEW BUTTON
        tableBody.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        ".registration-view-button"
                    );


                if (!button) {
                    return;
                }


                const id =
                    button.dataset.id;


                window.location.href =
                    "admin-registration-view.html?id=" +
                    encodeURIComponent(id);

            }
        );


        await loadRegistrations();

    }
);