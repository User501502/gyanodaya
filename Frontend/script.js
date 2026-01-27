/* ================= SHARED SITE LOGIC ================= */

// Mobile menu toggle
window.toggleMenu = function () {
  const nav = document.getElementById("navMenu");
  if (nav) nav.classList.toggle("active");
};

// Handle mobile dropdowns
document.addEventListener("DOMContentLoaded", () => {
  // Auto-init shared content
  const init = async () => {
    await loadNavbar();
    await loadGlobalSettings();
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
      await loadSections();
      await loadNoticeTicker();
    }
    setupMobileDropdowns();
  };
  init();
});

function setupMobileDropdowns() {
  const dropdowns = document.querySelectorAll(".dropdown-toggle");
  dropdowns.forEach(toggle => {
    toggle.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        toggle.parentElement.classList.toggle("nav-item-active");
      }
    });
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
            <div class="menu-toggle" onclick="toggleMenu()">☰</div>
            <nav id="navMenu">
                <ul id="navLinks">
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

    const mapFrame = document.getElementById("mapFrame");
    if (mapFrame && data.footer?.mapEmbed) mapFrame.src = data.footer.mapEmbed;

  } catch (err) {
    console.error("Failed to load global settings", err);
  }
}

// Dynamically Load Homepage Sections
window.loadSections = async function () {
  try {
    const res = await fetch("/api/sections");
    const sections = await res.json();
    const container = document.getElementById("sectionsContainer");
    if (!container) return;

    container.innerHTML = "";
    sections
      .filter(s => s.isActive)
      .sort((a, b) => a.position - b.position)
      .forEach(section => {
        let html = `<section class="section">
                        <div style="text-align:center; margin-bottom:40px;">
                            <h2 style="font-family:'Outfit', sans-serif; font-size:32px; color:var(--primary);">${section.title}</h2>
                            <div style="width:60px; height:4px; background:var(--accent); margin:15px auto;"></div>
                        </div>`;
        if (section.type === "list") {
          html += `<div class="grid">`;
          section.content.forEach(item => {
            html += `<div class="card" style="text-align:center;">
                        <i class="fas fa-check-circle" style="color:var(--primary); font-size:24px; margin-bottom:15px; display:block;"></i>
                        <p style="font-weight:500;">${item}</p>
                    </div>`;
          });
          html += `</div>`;
        } else {
          html += `<div class="card" style="line-height:1.8; font-size:16px;"><p>${section.content.join("<br>")}</p></div>`;
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

// Page Loader
window.addEventListener("load", () => {
  const loader = document.getElementById("pageLoader");
  if (loader) {
    loader.style.opacity = "0";
    setTimeout(() => {
      loader.style.display = "none";
      const content = document.getElementById("siteContent");
      if (content) content.style.display = "block";
    }, 500);
  }
});
