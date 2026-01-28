/* ================= SHARED SITE LOGIC ================= */

// Mobile menu toggle
window.toggleMobileMenu = function (event) {
  if (event) event.stopPropagation();
  const navLinks = document.getElementById("navLinks");
  if (navLinks) {
    navLinks.classList.toggle("active");

    // Log for debugging
    console.log("Menu toggled", navLinks.classList.contains("active"));
  }
};

// Close menu when clicking a link (mobile)
window.closeMenuOnClick = function () {
  if (window.innerWidth <= 768) {
    const navLinks = document.getElementById("navLinks");
    if (navLinks) navLinks.classList.remove("active");
  }
};

// Handle mobile dropdowns
document.addEventListener("DOMContentLoaded", () => {
  // Auto-init shared content
  const init = async () => {
    await loadNavbar();
    await loadGlobalSettings();

    const pageName = getPageName();
    await loadSections(pageName);

    if (pageName === 'home') {
      await loadNoticeTicker();
    }

    if (['calendar', 'fees', 'books'].includes(pageName)) {
      await loadPageRecords(pageName);
    }

    if (pageName === 'principal') {
      await loadPrincipalPage();
    }

    if (pageName === 'management') {
      await loadManagementPage();
    }

    setupMobileDropdowns();
    setupMobileMenuListeners();
  };
  init();
});

function getPageName() {
  const path = window.location.pathname;
  const file = path.split("/").pop();
  if (!file || file === "index.html" || file === "") return "home";
  return file.replace(".html", "");
}

function setupMobileDropdowns() {
  const dropdowns = document.querySelectorAll(".dropdown-toggle");
  dropdowns.forEach(toggle => {
    toggle.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const parent = toggle.parentElement;
        const dropdown = parent.querySelector('.dropdown-content');

        // Close other dropdowns
        document.querySelectorAll('.dropdown').forEach(d => {
          if (d !== parent) {
            d.classList.remove('nav-item-active');
          }
        });

        parent.classList.toggle("nav-item-active");
      }
    });
  });
}

function setupMobileMenuListeners() {
  const navLinks = document.getElementById("navLinks");

  if (!navLinks) return;

  // Close menu when clicking a navigation link (not dropdown toggles)
  const links = navLinks.querySelectorAll('a:not(.dropdown-toggle)');
  links.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        navLinks.classList.remove('active');
      }
    });
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
      const menuToggle = document.querySelector('.menu-toggle');
      const isClickInsideNav = navLinks.contains(e.target);
      const isClickOnToggle = menuToggle && menuToggle.contains(e.target);

      if (!isClickInsideNav && !isClickOnToggle && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
      }
    }
  });
}

// Dynamically Load Navbar to ensure consistency across separate pages
async function loadNavbar() {
  const header = document.querySelector('header');
  if (!header) return;

  header.innerHTML = `
        <div class="navbar">
            <a href="index.html" class="logo">
                <img id="schoolLogo" src="logo.png" alt="Logo" style="display:none;">
                <span id="schoolName">Gyanodaya Public School</span>
            </a>
            <div class="menu-toggle" onclick="toggleMobileMenu(event)">☰</div>
            <nav id="navMenu">
                <ul id="navLinks">
                    <li class="mobile-close" onclick="toggleMobileMenu(event)">&times;</li>
                    <li><a href="index.html">Home</a></li>
                    <li class="dropdown">
                        <a href="about.html" class="dropdown-toggle">About Us</a>
                        <div class="dropdown-content">
                            <a href="vision.html">Vision & Mission</a>
                            <a href="principal.html">Principal's Message</a>
                            <a href="management.html">Management</a>
                            <a href="infrastructure.html">Infrastructure</a>
                        </div>
                    </li>
                    <li class="dropdown">
                        <a href="academics.html" class="dropdown-toggle">Academics</a>
                        <div class="dropdown-content">
                            <a href="curriculum.html">Curriculum</a>
                            <a href="faculty.html">Our Faculty</a>
                            <a href="calendar.html">Calendar</a>
                            <a href="books.html">List of Books</a>
                        </div>
                    </li>
                    <li class="dropdown">
                        <a href="#" class="dropdown-toggle">Admissions</a>
                        <div class="dropdown-content">
                            <a href="admission-procedure.html">Procedure</a>
                            <a href="fees.html">Fee Structure</a>
                            <a href="online-apply.html">Apply Online</a>
                        </div>
                    </li>
                    <li class="dropdown">
                        <a href="#" class="dropdown-toggle">Information</a>
                        <div class="dropdown-content">
                            <a href="tc-issued.html">TC Issued</a>
                            <a href="disclosure.html">Mandatory Disclosure</a>
                            <a href="notice.html">Notices & News</a>
                        </div>
                    </li>
                    <li><a href="gallery.html">Gallery</a></li>
                    <li><a href="contact.html">Contact Us</a></li>
                </ul>
            </nav>
        </div>
    `;
}

// Load Logo, Name, and Footer from API
async function loadGlobalSettings() {
  try {
    const res = await fetch("/api/home");
    const data = await res.json();
    if (!data) return;

    // 1. Update School Name and Logo
    const nameEls = document.querySelectorAll("#schoolName");
    nameEls.forEach(el => el.innerText = data.schoolName || "Gyanodaya Public School");

    const logoImgs = document.querySelectorAll("#schoolLogo");
    logoImgs.forEach(img => {
      if (data.logo) {
        img.src = data.logo;
        img.style.display = "block";
      }
    });

    // 2. Update Footer
    const footer = document.getElementById("footer");
    if (footer && data.footer) {
      const f = data.footer;
      footer.innerHTML = `
                <div class="footer-grid">
                    <div>
                        <h4>About Our School</h4>
                        <p>${f.about || ""}</p>
                        <p><i class="fas fa-map-marker-alt"></i> ${f.address || ""}</p>
                    </div>
                    <div>
                        <h4>Quick Links</h4>
                        <ul>
                            ${(f.quickLinks || []).map(l => `<li><a href="${l.url}">${l.title}</a></li>`).join("")}
                        </ul>
                    </div>
                    <div>
                        <h4>Follow Us</h4>
                        <p>Stay connected with us on social media.</p>
                        <div class="social-icons">
                            ${(f.socials || []).map(s => `
                                <a href="${s.url}" target="_blank" title="${s.name}">
                                    <img src="${s.icon}" alt="${s.name}">
                                </a>
                            `).join("")}
                        </div>
                    </div>
                    <div>
                        <h4>Contact Us</h4>
                        <p><i class="fas fa-phone"></i> ${f.phone || ""}</p>
                        <p><i class="fas fa-envelope"></i> ${f.email || ""}</p>
                        <div style="margin-top:20px;">
                             <a href="admin/login.html" style="font-size:11px; opacity:0.3; color:white; text-decoration:none;">Admin Access</a>
                        </div>
                    </div>
                </div>
                <div style="text-align:center; margin-top:60px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.05); font-size:13px; opacity:0.5;">
                    ${f.copyright || "© 2026 Gyanodaya Public School"}
                </div>
            `;
    }

    // Home Page specific updates
    const heroTitle = document.getElementById("heroTitle");
    if (heroTitle) heroTitle.innerText = data.heroTitle || "";

    const heroIntro = document.getElementById("heroIntro");
    if (heroIntro) heroIntro.innerText = data.heroIntro || "";

    const heroSection = document.getElementById("heroSection");
    if (heroSection && data.heroImage) {
      heroSection.style.backgroundImage = `url('${data.heroImage}')`;
    }

    const admissionBadge = document.getElementById("admissionBadge");
    if (admissionBadge) {
      if (data.admissionOpen) {
        admissionBadge.style.display = "inline-block";
        admissionBadge.innerText = `Admissions Open ${data.admissionYear || "2024-25"}`;
      } else {
        admissionBadge.style.display = "none";
      }
    }

    const mapFrame = document.getElementById("mapFrame");
    if (mapFrame && data.footer?.mapEmbed) mapFrame.src = data.footer.mapEmbed;

    // Load Homepage Stats
    const stats = data.stats || {};
    const statStudents = document.getElementById("statStudents");
    const statTeachers = document.getElementById("statTeachers");
    const statFacilities = document.getElementById("statFacilities");
    const statSuccessRate = document.getElementById("statSuccessRate");

    if (statStudents && stats.students) statStudents.textContent = stats.students + "+";
    if (statTeachers && stats.teachers) statTeachers.textContent = stats.teachers + "+";
    if (statFacilities && stats.facilities) statFacilities.textContent = stats.facilities + "+";
    if (statSuccessRate && stats.successRate) statSuccessRate.textContent = stats.successRate + "%";

  } catch (err) {
    console.error("Failed to load global settings", err);
  }
}

// Dynamically Load Homepage Sections
window.loadSections = async function (page = "home") {
  try {
    const res = await fetch(`/api/sections?page=${page}`);
    const sections = await res.json();
    const container = document.getElementById("sectionsContainer");
    if (!container) return;

    const activeSections = sections.filter(s => s.isActive);
    container.innerHTML = "";

    activeSections.forEach(section => {
      let html = `<section class="section">
                        <div style="text-align:center; margin-bottom:40px;">
                            <h2 style="font-family:'Outfit', sans-serif; font-size:32px; color:var(--primary);">${section.title}</h2>
                            <div style="width:60px; height:4px; background:var(--accent); margin:15px auto;"></div>
                        </div>`;

      let flexBox = `<div style="display:flex; flex-direction:column; gap:30px;">`;

      // If there's an image, create a 2-column layout for text
      if (section.image && section.type === 'text') {
        flexBox = `<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap:40px; align-items:center;">
                    <div style="border-radius:15px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.1);">
                        <img src="${section.image}" style="width:100%; height:auto; display:block;">
                    </div>`;
      }

      if (section.type === "list") {
        let grid = `<div class="grid">`;
        section.content.forEach(item => {
          grid += `<div class="card" style="text-align:center;">
                        <i class="fas fa-check-circle" style="color:var(--primary); font-size:24px; margin-bottom:15px; display:block;"></i>
                        <p style="font-weight:500;">${item}</p>
                    </div>`;
        });
        grid += `</div>`;
        html += grid;
      } else {
        html += flexBox + `<div class="card" style="line-height:1.8; font-size:16px;"><p>${section.content.join("<br>")}</p></div>`;
        if (section.image) html += `</div>`; // close grid
      }

      html += `</section>`;
      container.innerHTML += html;
    });
  } catch (e) { console.error(e); }
};

// Function for notice ticker
window.loadNoticeTicker = async function () {
  try {
    const res = await fetch("/api/notices");
    const notices = await res.json();
    const ticker = document.getElementById("noticeTicker");
    const textEl = document.getElementById("noticeText");

    if (ticker && notices.length > 0) {
      ticker.style.display = "block";
      textEl.innerText = notices.map(n => n.title).join("  |  ✦  ");
    }
  } catch (err) { console.error(err); }
};

// Function to load specialized records (Fees, Books, Calendar)
window.loadPageRecords = async function (category) {
  const container = document.getElementById("recordsContainer");
  if (!container) return;

  try {
    const res = await fetch(`/api/records?category=${category}`);
    const data = await res.json();

    if (category === 'calendar') {
      renderVisualCalendar(data, container);
      return;
    }

    // Default Table View for Fees, Books, etc.
    let headers = [];
    if (category === 'fees') headers = ["Class", "Admission Fee", "Monthly Fee"];
    if (category === 'books') headers = ["Class", "Subject", "Book & Publisher"];

    const tableHtml = `
      <div class="card" style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; min-width:600px;">
          <thead>
            <tr style="background:var(--primary); color:white;">
              ${headers.map(h => `<th style="padding:15px; text-align:left;">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(r => `
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:15px; font-weight:600;">${r.col1}</td>
                <td style="padding:15px;">${r.col2}</td>
                <td style="padding:15px;">${r.col3 || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    container.innerHTML = tableHtml;
  } catch (err) { console.error(err); }
}

function renderVisualCalendar(events, container) {
  let currentCalDate = new Date();

  function draw() {
    const month = currentCalDate.getMonth();
    const year = currentCalDate.getFullYear();
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentCalDate);

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    container.innerHTML = `
      <div class="calendar-wrapper card" style="padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
           <button class="btn btn-secondary btn-sm" id="prevMonth"><i class="fas fa-chevron-left"></i></button>
           <h2 style="margin:0; font-family:'Outfit'; color:var(--primary);">${monthName}</h2>
           <button class="btn btn-secondary btn-sm" id="nextMonth"><i class="fas fa-chevron-right"></i></button>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px;">
           ${['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => `<div style="text-align:center; font-weight:bold; color:var(--primary); font-size:12px; padding:10px; background:#f8fafc;">${d}</div>`).join('')}
           ${Array(firstDay).fill(0).map(() => `<div style="background:#f1f5f9; min-height:100px; border-radius:8px;"></div>`).join('')}
           ${Array(daysInMonth).fill(0).map((_, i) => {
      const day = i + 1;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.col1 === dateStr);
      return `
                 <div style="background:white; border:1px solid #e2e8f0; min-height:100px; padding:10px; border-radius:8px; display:flex; flex-direction:column;">
                    <span style="font-weight:bold; color:#64748b; font-size:12px;">${day}</span>
                    <div style="margin-top:5px;">
                       ${dayEvents.map(e => `
                          <div style="font-size:10px; padding:4px 6px; background:var(--primary); color:white; border-radius:4px; margin-bottom:3px; line-height:1.2;">${e.col2}</div>
                       `).join('')}
                    </div>
                 </div>
               `;
    }).join('')}
        </div>
      </div>
    `;

    document.getElementById("prevMonth").onclick = () => {
      currentCalDate.setMonth(currentCalDate.getMonth() - 1);
      draw();
    };
    document.getElementById("nextMonth").onclick = () => {
      currentCalDate.setMonth(currentCalDate.getMonth() + 1);
      draw();
    };
  }

  draw();
  draw();
};

// Auto-load Notice Ticker
window.loadNoticeTicker = async function () {
  try {
    const res = await fetch("/api/notices");
    const notices = await res.json();
    const activeNotices = notices.filter(n => n.isActive);

    if (activeNotices.length > 0) {
      const tickerContainer = document.getElementById("noticeTicker");
      const tickerText = document.getElementById("noticeText");

      if (tickerContainer && tickerText) {
        tickerContainer.style.display = "flex";

        // Combine notices with a separator
        const textToScroll = activeNotices
          .map(n => `<span style="margin-right: 50px;">★ ${n.title}</span>`)
          .join("");

        tickerText.innerHTML = textToScroll;

        // Ensure marquee is running
        if (tickerText.start) tickerText.start();
      }
    }
  } catch (err) {
    console.error("Failed to load notice ticker", err);
  }
};

// Principal Page Loader
window.loadPrincipalPage = async function () {
  try {
    const res = await fetch("/api/people?type=principal");
    const data = await res.json();
    if (!data.name) return;

    const sectionsContainer = document.getElementById("sectionsContainer");
    const introHtml = `
      <section class="section">
        <div class="card" style="display: grid; grid-template-columns: 1fr 2fr; gap: 40px; align-items: start; padding: 40px;">
          <div class="principal-portrait">
            <img src="${data.photo || 'logo.png'}" alt="${data.name}" style="width: 100%; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-top: 15px;">
              <h3 style="color: var(--primary);">${data.name}</h3>
              <p style="color: var(--text-muted); font-size: 14px; font-weight: 600;">${data.designation}</p>
            </div>
          </div>
          <div class="principal-message">
            <i class="fas fa-quote-left" style="font-size: 40px; color: var(--accent); opacity: 0.3; margin-bottom: 20px;"></i>
            <div style="font-size: 17px; line-height: 1.8; color: #4b5563; white-space: pre-line;">${data.message}</div>
          </div>
        </div>
      </section>
    `;
    sectionsContainer.insertAdjacentHTML('afterbegin', introHtml);
  } catch (err) { console.error(err); }
};

// Management Page Loader
window.loadManagementPage = async function () {
  try {
    const res = await fetch("/api/people?type=management");
    const members = await res.json();
    if (members.length === 0) return;

    const sectionsContainer = document.getElementById("sectionsContainer");
    const gridHtml = `
      <section class="section">
        <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px;">
          ${members.map(m => `
            <div class="card" style="padding: 30px; border-top: 5px solid var(--primary);">
              <div style="display: flex; gap: 20px; align-items: start;">
                <img src="${m.photo || 'logo.png'}" style="width: 70px; height: 70px; border-radius: 50%; object-fit: cover;">
                <div>
                  <h3 style="font-size: 18px; margin-bottom: 5px;">${m.name}</h3>
                  <p style="color: var(--primary); font-weight: 700; font-size: 13px; text-transform: uppercase;">${m.designation}</p>
                </div>
              </div>
              ${m.message ? `<p style="margin-top: 20px; font-size: 14px; line-height: 1.6; color: var(--text-muted); font-style: italic;">"${m.message}"</p>` : ''}
            </div>
          `).join("")}
        </div>
      </section>
    `;
    sectionsContainer.insertAdjacentHTML('afterbegin', gridHtml);
  } catch (err) { console.error(err); }
};

// Page Loader & Content Visibility Fix
window.addEventListener("DOMContentLoaded", () => {
  // Ensure site content is visible if no loader exists
  const loader = document.getElementById("pageLoader");
  const content = document.getElementById("siteContent");

  if (!loader && content) {
    content.style.display = "block";
  }
});

window.addEventListener("load", () => {
  const loader = document.getElementById("pageLoader");
  const content = document.getElementById("siteContent");

  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
      if (content) content.style.display = "block";
    }, 500);
  } else if (content) {
    content.style.display = "block";
  }
});
