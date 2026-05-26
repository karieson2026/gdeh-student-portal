// ==========================================
// GDEH ADMIN DASHBOARD
// admin_dashboard.js
// ==========================================

// ==========================================
// GLOBAL VARIABLES
// ==========================================
const searchBox =
document.querySelector(".search-box");

const widgets =
document.querySelectorAll(".widget");

const logoutBtn =
document.querySelector('a[href="/logout"]');

const saveProfileBtn =
document.querySelectorAll(".btn")[0];

const transcriptBtn =
document.querySelectorAll(".btn")[1];

const timetableBtn =
document.querySelectorAll(".btn")[2];

const examBtn =
document.querySelectorAll(".btn")[3];

const examCardBtn =
document.querySelectorAll(".btn")[4];

const announcementBtn =
document.querySelectorAll(".btn")[5];

const studentPhoto =
document.getElementById("studentPhoto");

const studentInfo =
document.querySelector(".profile-info");

const profileInputs =
document.querySelectorAll(".widget.large input");

const courseSelect =
document.querySelector("select");

const announcementBox =
document.querySelector("textarea");


// ==========================================
// AUTH CHECK
// ==========================================
window.onload = () => {

    const role = localStorage.getItem("role");

    if(role !== "admin"){

        alert("Unauthorized Access");

        window.location.href = "index.html";

    }

    loadStudentProfile();

};


// ==========================================
// LOAD STUDENT PROFILE
// ==========================================
async function loadStudentProfile(){

    try{

        const response =
        await fetch("/students");

        const students =
        await response.json();

        if(students.length > 0){

            const student = students[0];

            studentInfo.innerHTML = `
                <p>${student.full_names}</p>
                <p>${student.email}</p>
                <p>${student.course}</p>
            `;

            profileInputs[0].value =
            student.full_names;

            profileInputs[1].value =
            student.email;

            courseSelect.value =
            student.course;

            if(student.photo){

                studentPhoto.src =
                student.photo;

            }

        }

    }

    catch(error){

        console.log(error);

    }

}


// ==========================================
// SEARCH FUNCTION
// ==========================================
searchBox.addEventListener("keyup", () => {

    const value =
    searchBox.value.toLowerCase();

    widgets.forEach(widget => {

        const text =
        widget.innerText.toLowerCase();

        if(text.includes(value)){

            widget.style.display = "block";

        }else{

            widget.style.display = "none";

        }

    });

});


// ==========================================
// SAVE PROFILE
// ==========================================
saveProfileBtn.addEventListener("click",
async () => {

    const full_names =
    profileInputs[0].value;

    const email =
    profileInputs[1].value;

    const course =
    courseSelect.value;

    try{

        const response =
        await fetch("/update-student",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                full_names,
                email,
                course
            })

        });

        const data =
        await response.json();

        if(data.success){

            alert(
            "Student Profile Updated");

            loadStudentProfile();

        }else{

            alert(
            "Unable to Update Profile");

        }

    }

    catch(error){

        console.log(error);

    }

});


// ==========================================
// FILE UPLOAD FUNCTION
// ==========================================
async function uploadFile(inputElement, endpoint){

    const file =
    inputElement.files[0];

    if(!file){

        alert("Choose file first");

        return;

    }

    const formData =
    new FormData();

    formData.append("file", file);

    try{

        const response =
        await fetch(endpoint,{

            method:"POST",

            body:formData

        });

        const data =
        await response.json();

        if(data.success){

            alert("Upload Successful");

        }else{

            alert("Upload Failed");

        }

    }

    catch(error){

        console.log(error);

    }

}


// ==========================================
// TRANSCRIPT UPLOAD
// ==========================================
transcriptBtn.addEventListener("click", () => {

    const input =
    transcriptBtn.previousElementSibling;

    uploadFile(
        input,
        "/upload-transcript"
    );

});


// ==========================================
// TIMETABLE UPLOAD
// ==========================================
timetableBtn.addEventListener("click", () => {

    const input =
    timetableBtn.previousElementSibling;

    uploadFile(
        input,
        "/upload-timetable"
    );

});


// ==========================================
// EXAM / ASSIGNMENT UPLOAD
// ==========================================
examBtn.addEventListener("click", () => {

    const input =
    examBtn.previousElementSibling;

    uploadFile(
        input,
        "/upload-exam"
    );

});


// ==========================================
// EXAM CARD UPLOAD
// ==========================================
examCardBtn.addEventListener("click", () => {

    const input =
    examCardBtn.previousElementSibling;

    uploadFile(
        input,
        "/upload-exam-card"
    );

});


// ==========================================
// ANNOUNCEMENTS
// ==========================================
announcementBtn.addEventListener(
"click",
async () => {

    const message =
    announcementBox.value.trim();

    if(message === ""){

        alert("Enter announcement");

        return;

    }

    try{

        const response =
        await fetch(
            "/admin/post-announcement",
            {
                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    title:"GDEH Announcement",

                    message:message

                })

            }
        );

        const data =
        await response.json();

        if(data.success){

            alert(
            "Announcement Published"
            );

            announcementBox.value = "";

        }else{

            alert(
            "Failed to Publish"
            );

        }

    }

    catch(error){

        console.log(error);

    }

});

// ==========================================
// LOGOUT
// ==========================================
logoutBtn.addEventListener("click",
(e) => {

    e.preventDefault();

    localStorage.clear();

    alert("Logged Out");

    window.location.href =
    "index.html";

});


// ==========================================
// ACTIVE SIDEBAR LINKS
// ==========================================
const sidebarLinks =
document.querySelectorAll(".sidebar a");

sidebarLinks.forEach(link => {

    link.addEventListener("click", function(){

        sidebarLinks.forEach(l => {

            l.classList.remove("active");

        });

        this.classList.add("active");

    });

});


// ==========================================
// LIVE CLOCK TITLE
// ==========================================
function updateClock(){

    const now =
    new Date();

    document.title =
    `GDEH Admin Dashboard • ${
        now.toLocaleTimeString()
    }`;

}

setInterval(updateClock, 1000);


// ==========================================
// AUTO REFRESH STUDENT DATA
// ==========================================
setInterval(loadStudentProfile, 60000);
