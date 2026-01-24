// TEMP LOGIN (Firebase later)
function login() {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;

  if(email === "admin@school.com" && pass === "admin123"){
    localStorage.setItem("adminLogged", "true");
    window.location.href = "dashboard.html";
  } else {
    alert("Invalid Login");
  }
}

function checkAuth() {
  if(localStorage.getItem("adminLogged") !== "true"){
    window.location.href = "login.html";
  }
}

function logout() {
  localStorage.removeItem("adminLogged");
  window.location.href = "login.html";
}
