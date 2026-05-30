document.addEventListener("DOMContentLoaded", () => {

    const resetBtn = document.getElementById("resetBtn");
    const inputField = document.getElementById("email_username");

    resetBtn.addEventListener("click", async () => {

        const identifier = inputField.value.trim();

        if (!identifier) {
            alert("Please enter your email or username.");
            inputField.focus();
            return;
        }

        try {

            resetBtn.disabled = true;
            resetBtn.textContent = "Sending...";

            const response = await fetch("/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    identifier
                })
            });

            const data = await response.json();

            if (data.success) {

                alert(
                    "Password reset link has been sent to your registered email."
                );

                inputField.value = "";

            } else {

                alert(
                    data.message ||
                    "Failed to send password reset link."
                );

            }

        } catch (error) {

            console.error("Forgot Password Error:", error);

            alert(
                "Unable to connect to the server. Please try again later."
            );

        } finally {

            resetBtn.disabled = false;
            resetBtn.textContent = "Reset Password";

        }

    });

    inputField.addEventListener("keypress", (event) => {

        if (event.key === "Enter") {
            resetBtn.click();
        }

    });

});
