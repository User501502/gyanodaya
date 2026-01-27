import { auth, onAuthStateChanged, signOut } from "./firebase.js";

/**
 * Protects a page by redirecting to login if not authenticated.
 */
export function protectPage() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Not logged in, redirect
        if (!window.location.pathname.includes("login.html")) {
          window.location.href = "login.html";
        }
        resolve(null);
      } else {
        // Logged in
        if (window.location.pathname.includes("login.html")) {
          window.location.href = "dashboard.html";
        }
        resolve(user);
      }
    });
  });
}

/**
 * Common API fetcher for admin
 */
export async function api(url, options = {}) {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : "";

  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };

  const res = await fetch(url, {
    ...options,
    headers
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "API Error" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

/**
 * Initialize Sidebar functionality (Consistency)
 */
export function initSidebar() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      if (confirm("Are you sure you want to logout?")) {
        await signOut(auth);
        window.location.href = "login.html";
      }
    };
  }

  // Highlight active link
  const currentPath = window.location.pathname;
  const links = document.querySelectorAll(".sidebar a");
  links.forEach(link => {
    if (currentPath.includes(link.getAttribute("href"))) {
      link.classList.add("active");
    }
  });
}
