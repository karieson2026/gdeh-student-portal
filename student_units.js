// =====================================
// AUTH CHECK
// =====================================
const studentId =
localStorage.getItem("userId");

if(!studentId){

    window.location.href =
    "index.html";

}

// =====================================
// LOAD UNITS
// =====================================
async function loadUnits(){

    try{

        const res =
        await fetch(
            `/student/units/${studentId}`
        );

        const data =
        await res.json();

        console.log(data);

        if(!data.success){

            alert("Failed to load units");
            return;

        }

        // =========================
        // COURSE NAME
        // =========================
        document.getElementById(
            "courseName"
        ).innerText =
        data.student.course;

        // =========================
        // UNITS CONTAINER
        // =========================
        const container =
        document.getElementById(
            "unitsContainer"
        );

        container.innerHTML = "";

        // =========================
        // RENDER UNITS
        // =========================
        data.units.forEach(unit => {

            container.innerHTML += `

            <div class="unit-card">

                <div class="unit-code">
                    ${unit.unit_code}
                </div>

                <div class="unit-name">
                    ${unit.unit_name}
                </div>

                <button
                class="register-btn"
                onclick="registerUnit(${unit.id})">

                    Register

                </button>

            </div>

            `;

        });

    }

    catch(err){

        console.log(err);

        alert("Server error");

    }

}

// =====================================
// REGISTER UNIT
// =====================================
async function registerUnit(unitId){

    try{

        const res =
        await fetch(
            "/register-unit",
            {
                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({
                    student_id:studentId,
                    unit_id:unitId
                })
            }
        );

        const data =
        await res.json();

        if(data.success){

            alert("Unit Registered Successfully");

        }else{

            alert(
                data.message ||
                "Registration failed"
            );

        }

    }

    catch(err){

        console.log(err);

        alert("Server error");

    }

}

// =====================================
// LOGOUT
// =====================================
function logoutStudent(){

    localStorage.clear();

    window.location.href =
    "index.html";

}

// LOAD PAGE
loadUnits();
