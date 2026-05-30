document
.getElementById("resetBtn")
.addEventListener("click", async () => {

    const emailOrUsername =
        document
        .getElementById("email_username")
        .value
        .trim();

    if (!emailOrUsername) {
        alert("Enter your email or username");
        return;
    }

    try {

        const res = await fetch(
            "/forgot-password",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    emailOrUsername
                })
            }
        );

        const data = await res.json();

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
                "Failed to send reset link"
            );

        }

    } catch (err) {

        console.error(err);

        alert(
            "Server error. Please try again."
        );

    }

});
