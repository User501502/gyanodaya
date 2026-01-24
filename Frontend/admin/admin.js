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
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!res.ok) throw new Error("API error");
  return res.json();
}

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  location.href = "/admin/login.html";
});
