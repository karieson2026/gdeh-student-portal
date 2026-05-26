// =====================================
// index.js
// GDEH LOGIN SYSTEM (UPDATED)
// =====================================

// =====================================
// LOGIN FORM
// =====================================
const loginForm =
document.getElementById("loginForm");

// =====================================
// LOGIN SUBMIT
// =====================================
document.getElementById("loginBtn")
.addEventListener(
"click",
async (e) => {

    e.preventDefault();

    // =========================
    // GET VALUES
    // =========================
    const username =
    document.getElementById("username")
    .value
    .trim();

    const password =
    document.getElementById("password")
    .value
    .trim();

    // =========================
    // VALIDATION
    // =========================
    if(!username || !password){

        alert("Please enter username and password");
        return;

    }

    try{

        // =========================
        // LOGIN REQUEST
        // =========================
        const response =
        await fetch("/login",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                username,
                password
            })

        });

        const data =
        await response.json();

        console.log(data);

        // =========================
        // SUCCESS
        // =========================
        if(data.success){

            alert("Login successful");

            // =====================
            // SAVE USER DATA
            // =====================
            localStorage.setItem(
                "userId",
                data.user.id
            );

            localStorage.setItem(
                "username",
                data.user.username
            );

            localStorage.setItem(
                "role",
                data.user.role
            );

            localStorage.setItem(
                "fullName",
                data.user.full_names || ""
            );

            localStorage.setItem(
                "email",
                data.user.email || ""
            );

            localStorage.setItem(
                "phone",
                data.user.phone_number || ""
            );

            localStorage.setItem(
                "address",
                data.user.address || ""
            );

            localStorage.setItem(
                "county",
                data.user.county || ""
            );

            localStorage.setItem(
                "course",
                data.user.course || ""
            );

            localStorage.setItem(
                "profilePhoto",
                data.user.profile_photo || "/uploads/default.png"
            );

            // =====================
            // ADMIN
            // =====================
            if(data.user.role === "admin"){

                window.location.href =
                "admin_dashboard.html";

            }

            // =====================
            // STUDENT
            // =====================
            else{

                window.location.href =
                "student_dashboard.html";

            }

        }

        // =========================
        // FAILED
        // =========================
        else{

            alert(
                data.message ||
                "Invalid username or password"
            );

        }

    }

    catch(error){

        console.log(error);

        alert("Server error");

    }

});
