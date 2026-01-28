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
            <div class="sidebar-nav">
                <div class="sidebar-group">PRIMARY MANAGEMENT</div>
                <a href="dashboard.html"><i class="fas fa-chart-line"></i> Dashboard</a>
                <a href="home.html"><i class="fas fa-cog"></i> Global Settings</a>
                <a href="assets.html"><i class="fas fa-folder-open"></i> File & Media Library</a>
                
                <div class="sidebar-group">SPECIFIC PAGE WORK</div>
                <a href="principal.html"><i class="fas fa-user-tie"></i> Principal's Message</a>
                <a href="management.html"><i class="fas fa-users-cog"></i> Management Team</a>
                <a href="calendar.html"><i class="fas fa-calendar-check"></i> Academic Calendar</a>
                <a href="faculty.html"><i class="fas fa-graduation-cap"></i> Staff & Faculty</a>

                <div class="sidebar-group">GENERAL PAGE SECTIONS</div>
                <a href="sections.html?page=home"><i class="fas fa-home"></i> Home Sections</a>
                <a href="sections.html?page=about"><i class="fas fa-info-circle"></i> About Us</a>
                <a href="sections.html?page=vision"><i class="fas fa-eye"></i> Vision & Mission</a>
                <a href="sections.html?page=infrastructure"><i class="fas fa-building"></i> Infrastructure</a>
                <a href="sections.html?page=academics"><i class="fas fa-scroll"></i> Academics Landing</a>
                <a href="sections.html?page=curriculum"><i class="fas fa-book"></i> Curriculum</a>
                <a href="sections.html?page=contact"><i class="fas fa-envelope-open-text"></i> Contact Us</a>

                <div class="sidebar-group">SPECIALIZED DATA (TABLES)</div>
                <a href="records.html?category=fees"><i class="fas fa-money-bill-wave"></i> Fee Structure</a>
                <a href="records.html?category=books"><i class="fas fa-book-open"></i> List of Books</a>

                <div class="sidebar-group">DATABASE RECORDS</div>
                <a href="notices.html"><i class="fas fa-list-ul"></i> All Notices</a>
                <a href="admissions.html"><i class="fas fa-user-graduate"></i> Admission Enquiries</a>
                <a href="gallery.html"><i class="fas fa-images"></i> Gallery Items</a>
                <a href="tc.html"><i class="fas fa-file-signature"></i> TC Records</a>
                <a href="disclosure.html"><i class="fas fa-shield-halved"></i> Disclosure Docs</a>
            </div>
            
            <div class="sidebar-bottom">
                <a href="settings.html"><i class="fas fa-lock"></i> Security</a>
                <button id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</button>
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
  const currentFullUrl = window.location.pathname + window.location.search;
  const links = document.querySelectorAll(".sidebar a");
  links.forEach(link => {
    const href = link.getAttribute("href");
    if (href && (currentFullUrl.endsWith(href) || window.location.href.includes(href))) {
      link.classList.add("active");
    }
  });
}
