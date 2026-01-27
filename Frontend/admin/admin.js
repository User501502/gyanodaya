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
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    sidebar.innerHTML = `
            <h3>Gyanodaya Admin</h3>
            <a href="dashboard.html">Dashboard</a>
            <a href="home.html">Home Management</a>
            <a href="sections.html">Sections</a>
            <a href="faculty.html">Faculty</a>
            <a href="notices.html">Notices</a>
            <a href="admissions.html">Admissions</a>
            <a href="gallery.html">Gallery</a>
            <a href="tc.html">TC Issued</a>
            <a href="disclosure.html">Disclosures</a>
            <div class="sidebar-bottom">
                <a href="settings.html">Settings</a>
                <button id="logoutBtn">Logout</button>
            </div>
        `;
  }

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
    const href = link.getAttribute("href");
    if (href && currentPath.endsWith(href)) {
      link.classList.add("active");
    }
  });
}
