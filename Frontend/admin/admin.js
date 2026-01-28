import { auth, onAuthStateChanged, signOut } from "./firebase.js";

export async function protectPage() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (!user && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
      } else {
        resolve(user);
      }
    });
  });
}

export function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
            <div class="sidebar-header">
                <i class="fas fa-university"></i>
                <span>Gyanodaya Panel</span>
            </div>
            <div class="sidebar-nav">
                <div class="sidebar-group">PRIMARY MANAGEMENT</div>
                <a href="dashboard.html"><i class="fas fa-chart-line"></i> Dashboard</a>
                <a href="home.html"><i class="fas fa-cog"></i> Global Settings</a>
                <a href="assets.html"><i class="fas fa-folder-open"></i> Media Library</a>
                
                <div class="sidebar-group">STUDENT & FEES</div>
                <a href="students.html"><i class="fas fa-user-graduate"></i> Student Database</a>
                <a href="due-fees.html"><i class="fas fa-file-invoice-dollar"></i> Due Fees Tracker</a>

                <div class="sidebar-group">SPECIFIC PAGE WORK</div>
                <a href="principal.html"><i class="fas fa-user-tie"></i> Principal's Message</a>
                <a href="management.html"><i class="fas fa-users-cog"></i> Management Team</a>
                <a href="calendar.html"><i class="fas fa-calendar-check"></i> Academic Calendar</a>
                <a href="faculty.html"><i class="fas fa-chalkboard-teacher"></i> Staff & Faculty</a>

                <div class="sidebar-group">GENERAL PAGE SECTIONS</div>
                <a href="sections.html?page=home"><i class="fas fa-home"></i> Home Sections</a>
                <a href="sections.html?page=about"><i class="fas fa-info-circle"></i> About Us</a>
                <a href="sections.html?page=vision"><i class="fas fa-eye"></i> Vision & Mission</a>
                <a href="sections.html?page=infrastructure"><i class="fas fa-building"></i> Infrastructure</a>
                <a href="sections.html?page=academics"><i class="fas fa-scroll"></i> Academics Landing</a>
                <a href="sections.html?page=curriculum"><i class="fas fa-book"></i> Curriculum</a>
                <a href="sections.html?page=contact"><i class="fas fa-envelope-open-text"></i> Contact Us</a>

                <div class="sidebar-group">DATABASE RECORDS</div>
                <a href="notices.html"><i class="fas fa-list-ul"></i> All Notices</a>
                <a href="admissions.html"><i class="fas fa-reply-all"></i> Enquiries</a>
                <a href="gallery.html"><i class="fas fa-images"></i> Gallery</a>
                <a href="tc.html"><i class="fas fa-file-signature"></i> TC Records</a>
                <a href="disclosure.html"><i class="fas fa-shield-halved"></i> Disclosure Docs</a>
            </div>
            
            <div class="sidebar-bottom">
                <a href="settings.html"><i class="fas fa-user-shield"></i> Profile & Backup</a>
                <button id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</button>
            </div>
        `;

  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = 'login.html';
  });
}

export async function api(url, options = {}) {
  const user = auth.currentUser;
  const token = user ? await user.getIdToken() : null;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    window.location.href = 'login.html';
  }
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'API Request Failed');
  }
  return res.json();
}
