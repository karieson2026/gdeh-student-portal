// =====================================
// GDEH STUDENT SIGNUP JS
// student_signup.js
// =====================================

// =====================================
// ELEMENTS
// =====================================
const signupForm =
document.getElementById("signupForm");

const sendOtpBtn =
document.getElementById("sendOtpBtn");

const otpInput =
document.getElementById("otp-code");

const submitBtn =
document.getElementById("submitBtn");

const timerDisplay =
document.getElementById("otp-timer");

const portalMessageBox =
document.getElementById("portalMessageBox");

// =====================================
// GLOBALS
// =====================================
let countdown;
let otpVerified = false;
let otpExpired = false;

// =====================================
// MESSAGE BOX
// =====================================
function showMessage(message, type = "error"){

    portalMessageBox.innerText = message;

    portalMessageBox.className =
    `portal-message ${type}`;

}

// =====================================
// CLEAR MESSAGE
// =====================================
function clearMessage(){

    portalMessageBox.innerText = "";

    portalMessageBox.className =
    "portal-message";

}

// =====================================
// ENABLE BUTTON
// =====================================
function enableSubmit(){

    submitBtn.disabled = false;

    submitBtn.classList.add("active");

}

// =====================================
// DISABLE BUTTON
// =====================================
function disableSubmit(){

    submitBtn.disabled = true;

    submitBtn.classList.remove("active");

}

// =====================================
// OTP TIMER
// =====================================
function startTimer(duration = 300){

    clearInterval(countdown);

    let seconds = duration;

    otpExpired = false;

    countdown = setInterval(()=>{

        const mins =
        Math.floor(seconds / 60);

        const secs =
        seconds % 60;

        timerDisplay.textContent =
        `${mins.toString().padStart(2,"0")}:${secs.toString().padStart(2,"0")}`;

        seconds--;

        if(seconds < 0){

            clearInterval(countdown);

            otpExpired = true;

            otpVerified = false;

            timerDisplay.textContent =
            "Expired";

            disableSubmit();

            showMessage(
                "OTP expired. Request a new OTP.",
                "error"
            );

        }

    },1000);

}

// =====================================
// SEND OTP
// =====================================
sendOtpBtn.addEventListener(
"click",
async ()=>{

    clearMessage();

    const email =
    document.getElementById("email")
    .value
    .trim()
    .toLowerCase();

    if(!email){

        showMessage(
            "Please enter your Gmail address",
            "error"
        );

        return;

    }

    try{

        sendOtpBtn.disabled = true;

        sendOtpBtn.innerText =
        "Sending...";

        const response =
        await fetch("/send-otp",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                email
            })

        });

        const data =
        await response.json();

        if(data.success){

            otpVerified = false;

            disableSubmit();

            startTimer();

            showMessage(
                "OTP sent successfully to your Gmail",
                "success"
            );

        }

        else{

            showMessage(
                data.message ||
                "Failed to send OTP",
                "error"
            );

        }

    }

    catch(error){

        console.log(error);

        showMessage(
            "Server error while sending OTP",
            "error"
        );

    }

    finally{

        sendOtpBtn.disabled = false;

        sendOtpBtn.innerText =
        "Send OTP";

    }

});

// =====================================
// VERIFY OTP LIVE
// =====================================
otpInput.addEventListener(
"input",
async ()=>{

    clearMessage();

    const otp =
    otpInput.value
    .trim();

    const email =
    document.getElementById("email")
    .value
    .trim()
    .toLowerCase();

    otpVerified = false;

    disableSubmit();

    // ONLY VERIFY 6 DIGITS
    if(otp.length !== 6){

        return;

    }

    if(otpExpired){

        showMessage(
            "OTP already expired",
            "error"
        );

        return;

    }

    try{

        const response =
        await fetch("/verify-otp",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                email,
                otp
            })

        });

        const data =
        await response.json();

        // VERIFIED
        if(data.success){

            otpVerified = true;

            enableSubmit();

            showMessage(
                "OTP verified successfully",
                "success"
            );

        }

        // FAILED
        else{

            otpVerified = false;

            disableSubmit();

            showMessage(
                data.message ||
                "Invalid OTP",
                "error"
            );

        }

    }

    catch(error){

        console.log(error);

        showMessage(
            "OTP verification failed",
            "error"
        );

    }

});

// =====================================
// SIGNUP SUBMIT
// =====================================
signupForm.addEventListener(
"submit",
async (e)=>{

    e.preventDefault();

    clearMessage();

    // OTP CHECK
    if(!otpVerified){

        showMessage(
            "Verify OTP first",
            "error"
        );

        return;

    }

    // PASSWORD CHECK
    const password =
    document.getElementById("password")
    .value
    .trim();

    const confirmPassword =
    document.getElementById("confirm-password")
    .value
    .trim();

    if(password !== confirmPassword){

        showMessage(
            "Passwords do not match",
            "error"
        );

        return;

    }

    // =====================================
    // FORM DATA
    // =====================================
    const formData =
    new FormData();

    formData.append(
        "full_name",
        document.getElementById("fullname").value.trim()
    );

    formData.append(
        "phone",
        document.getElementById("phone").value.trim()
    );

    formData.append(
        "email",
        document.getElementById("email").value.trim()
    );

    formData.append(
        "county",
        document.getElementById("county").value.trim()
    );

    formData.append(
        "zip_code",
        document.getElementById("zip").value.trim()
    );

    formData.append(
        "address",
        document.getElementById("address").value.trim()
    );

    formData.append(
        "course",
        document.getElementById("course-selection").value.trim()
    );

    formData.append(
        "username",
        document.getElementById("username").value.trim()
    );

    formData.append(
        "password",
        password
    );

    formData.append(
        "otp",
        otpInput.value.trim()
    );

    // PROFILE PHOTO
    const fileInput =
    document.getElementById("profile-photo");

    if(
        fileInput &&
        fileInput.files.length > 0
    ){

        formData.append(
            "profile_photo",
            fileInput.files[0]
        );

    }

    try{

        submitBtn.disabled = true;

        submitBtn.innerText =
        "Creating...";

        const response =
        await fetch("/signup",{

            method:"POST",

            body:formData

        });

        const data =
        await response.json();

        // SUCCESS
        if(data.success){

            showMessage(
                "Student account created successfully",
                "success"
            );

            signupForm.reset();

            disableSubmit();

            clearInterval(countdown);

            timerDisplay.textContent =
            "05:00";

            setTimeout(()=>{

                window.location.href =
                "index.html";

            },1500);

        }

        // FAILED
        else{

            showMessage(
                data.message ||
                "Signup failed",
                "error"
            );

            enableSubmit();

        }

    }

    catch(error){

        console.log(error);

        showMessage(
            "Server error during signup",
            "error"
        );

        enableSubmit();

    }

    finally{

        submitBtn.innerText =
        "Create Account";

    }

});
