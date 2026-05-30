document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("forgotPasswordForm");

    form.addEventListener("submit", async (e) => {

        e.preventDefault();

        const identifier =
            document.getElementById("identifier").value.trim();

        if (!identifier) {
            alert("Enter your email or username");
            return;
        }

        try {

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
                    "Password reset link has been sent to your email."
                );

                form.reset();

            } else {

                alert(
                    data.message || "Request failed"
                );

            }

        } catch (err) {

            console.error(err);

            alert(
                "Unable to connect to server."
            );

        }

    });

});
