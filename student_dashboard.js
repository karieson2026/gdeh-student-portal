function logoutUser(){

    localStorage.clear();

    window.location.href =
    "index.html";

}

async function loadDashboard() {

    // =========================
    // GET LOGGED USER
    // =========================
    const studentId =
    localStorage.getItem("userId");

    // NOT LOGGED IN
    if (!studentId) {

        window.location.href =
        "index.html";

        return;
    }

    try {

        // =====================
        // FETCH DATA
        // =====================
        const res =
        await fetch(
            `/dashboard-data/${studentId}`
        );

        const data =
        await res.json();

        console.log(data);

        if (!data.success) {

            alert("Failed to load dashboard");

            return;
        }

        // =====================
        // STUDENT INFO
        // =====================
        document.querySelector(".student-name").innerText =
            data.user.full_names;

        document.querySelector(".course").innerText =
            data.user.course;

        document.querySelector(".profile-pic").src =
            data.user.profile_photo || "student.jpg";

        // =====================
        // INFO BOXES
        // =====================
        const boxes =
        document.querySelectorAll(".info-box .value");

        boxes[0].innerText =
            data.user.full_names;

        boxes[1].innerText =
            data.user.phone_number;

        boxes[2].innerText =
            data.user.email;

        boxes[3].innerText =
            data.user.address;

        boxes[4].innerText =
            data.user.course;

        boxes[5].innerText =
            data.fees?.[0]?.payment_status || "Pending";

        boxes[6].innerText =
            data.user.zip_code;

        // =====================
        // DOWNLOAD LINKS
        // =====================
        document.querySelectorAll(".menu-card a")[0].href =
            data.transcript?.transcript_file || "#";

        document.querySelectorAll(".menu-card a")[1].href =
            data.timetable?.timetable_file || "#";

        document.querySelectorAll(".menu-card a")[2].href =
            data.examCard?.exam_card_file || "#";

        // =====================
        // ANNOUNCEMENTS
        // =====================
        const ann =
        document.getElementById("announcements");

        if (
            ann &&
            data.announcements
        ) {

            ann.innerHTML = "";

            data.announcements.forEach(a => {

                const div =
                document.createElement("div");

                div.style.padding = "6px";
                div.style.marginBottom = "5px";
                div.style.background = "#1f1f1f";

                div.innerHTML =
                `<b>${a.title}</b><br>${a.message}`;

                ann.appendChild(div);

            });

        }

    }

    catch(err) {

        console.log(err);

        alert("Dashboard error");

    }

}

// LOAD DASHBOARD
loadDashboard();
