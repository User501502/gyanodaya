import { auth, onAuthStateChanged, signOut } from "./firebase.js";

export function protectPage() {
  onAuthStateChanged(auth, user => {
    if (!user) {
      location.href = "/admin/login.html";
    }
  });
}

export async function getToken() {
  const user = auth.currentUser;
  return user ? await user.getIdToken() : null;
}

export async function api(url, options = {}) {
  const token = await getToken();
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error("API Error");
  return res.json();
}

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  location.href = "/admin/login.html";
});
