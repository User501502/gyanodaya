/* ================= AUTH ================= */
async function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const error = document.getElementById("error");

  if (!email || !password) {
    error.innerText = "All fields are required";
    return;
  }

  try {
    await firebaseAuth.signInWithEmailAndPassword(
      firebaseAuth.auth,
      email,
      password
    );
    window.location.href = "dashboard.html";
  } catch (e) {
    error.innerText = "Invalid login credentials";
  }
}

function protect() {
  firebaseAuth.onAuthStateChanged(firebaseAuth.auth, user => {
    if (!user) window.location.href = "login.html";
  });
}

function logout() {
  firebaseAuth.signOut(firebaseAuth.auth).then(() => {
    window.location.href = "login.html";
  });
}

/* ================= API ================= */
const API = "/api";

async function api(url, method = "GET", body) {
  const user = firebaseAuth.auth.currentUser;
  const token = await user.getIdToken();

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: body ? JSON.stringify(body) : null
  });

  if (!res.ok) throw new Error("API Error");
  return res.json();
}

