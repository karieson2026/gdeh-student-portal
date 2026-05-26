// ==========================================
// GDEH RESET PASSWORD (FIXED VERSION)
// ==========================================

// ==========================================
// ELEMENTS
// ==========================================
const resetBtn = document.getElementById("resetBtn");

const newPasswordInput =
document.getElementById("new_password");

const confirmPasswordInput =
document.getElementById("confirm_password");

// ==========================================
// GET TOKEN FROM URL
// ==========================================
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

// ==========================================
// TOGGLE PASSWORD
// ==========================================
function togglePassword(id) {
    const input = document.getElementById(id);

    input.type = input.type === "password" ? "text" : "password";
}

// ==========================================
// PASSWORD VALIDATION
// ==========================================
function validatePassword(password) {
    return password.length >= 6;
}

// ==========================================
// RESET PASSWORD
// ==========================================
resetBtn.addEventListener("click", async () => {

    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // ==============================
    // CHECK TOKEN
    // ==============================
    if (!token) {
        alert("Invalid or missing reset token");
        return;
    }

    // ==============================
    // EMPTY FIELDS
    // ==============================
    if (!newPassword || !confirmPassword) {
        alert("All fields are required");
        return;
    }

    // ==============================
    // PASSWORD LENGTH
    // ==============================
    if (!validatePassword(newPassword)) {
        alert("Password must be at least 6 characters");
        return;
    }

    // ==============================
    // PASSWORD MATCH
    // ==============================
    if (newPassword !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {

        const response = await fetch("/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token,
                password: newPassword
            })
        });

        const data = await response.json();

        if (data.success) {

            alert("Password reset successful");

            window.location.href = "index.html";

        } else {

            alert(data.message || "Unable to reset password");

        }

    } catch (error) {

        console.log(error);
        alert("Server Error");

    }

});

// ==========================================
// ENTER KEY SUPPORT
// ==========================================
document.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        resetBtn.click();
    }
});

// ==========================================
// AUTO FOCUS
// ==========================================
window.onload = () => {
    newPasswordInput.focus();
};
