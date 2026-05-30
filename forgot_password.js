const resetBtn = document.getElementById("resetBtn");

resetBtn.addEventListener("click", async () => {

    const identifier = document
        .getElementById("email_username")
        .value
        .trim();

    if (!identifier) {
        alert("Enter email or username");
        return;
    }

    resetBtn.disabled = true;
    resetBtn.innerText = "Please wait...";

    try {

        const response = await fetch(
            "https://gdeh-student-portal-1.onrender.com/forgot-password",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    identifier
                })
            }
        );

        const data = await response.json();

        if (data.success) {

            alert(
                "Password reset link has been sent to your email."
            );

            document.getElementById(
                "email_username"
            ).value = "";

        } else {

            alert(
                data.message ||
                "Failed to send reset link."
            );

        }

    } catch (error) {

        console.log(error);

        alert(
            "Network error. Please try again."
        );

    }

    resetBtn.disabled = false;
    resetBtn.innerText = "Reset Password";

});
