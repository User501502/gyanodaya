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
            <a href="dashboard.html"><i class="fas fa-chart-line"></i> Dashboard</a>
            <hr style="opacity:0.1; margin:10px 0;">
            <a href="home.html"><i class="fas fa-home"></i> Global Settings</a>
            <a href="sections.html"><i class="fas fa-align-left"></i> Page Content</a>
            <hr style="opacity:0.1; margin:10px 0;">
            <a href="notices.html"><i class="fas fa-bullhorn"></i> News & Notices</a>
            <a href="faculty.html"><i class="fas fa-users-rectangle"></i> Faculty Members</a>
            <a href="admissions.html"><i class="fas fa-user-graduate"></i> Admissions</a>
            <a href="gallery.html"><i class="fas fa-images"></i> School Gallery</a>
            <a href="tc.html"><i class="fas fa-file-contract"></i> TC Records</a>
            <a href="disclosure.html"><i class="fas fa-shield-halved"></i> Disclosure Docs</a>
            
            <div class="sidebar-bottom" style="margin-top:auto; padding-top:20px;">
                <a href="settings.html"><i class="fas fa-cog"></i> Security Settings</a>
                <button id="logoutBtn" style="width:100%; padding:10px; background:rgba(255,255,255,0.1); color:white; border:none; border-radius:6px; cursor:pointer; margin-top:10px;">Logout</button>
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
