document.getElementById("resetBtn")
.addEventListener("click", async ()=>{

  const emailOrUsername =
    document.getElementById("email_username").value;

  const res = await fetch("/forgot-password",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      emailOrUsername
    })
  });

  const data = await res.json();

  if(data.success){

    alert("Reset token: " + data.token);

    localStorage.setItem(
      "reset_token",
      data.token
    );

    window.location.href="reset_password.html";

  }else{
    alert(data.message);
  }

});
