/* ================= SHARED SITE LOGIC ================= */

// Mobile menu toggle
window.toggleMenu = function () {
  const nav = document.getElementById("navMenu");
  nav.classList.toggle("active");
};

// Handle mobile dropdowns
document.addEventListener("DOMContentLoaded", () => {
  const dropdowns = document.querySelectorAll(".dropdown-toggle");
  dropdowns.forEach(toggle => {
    toggle.addEventListener("click", (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        toggle.parentElement.classList.toggle("nav-item-active");
      }
    });
  });

  // Auto-init shared content
  loadGlobalSettings();
});

// Load Logo, Name, and Footer from API
async function loadGlobalSettings() {
  try {
    const res = await fetch("/api/home");
    const data = await res.json();
    if (!data) return;

    // 1. Update School Name and Logo (if exists)
    const nameEl = document.getElementById("schoolName");
    if (nameEl) nameEl.innerText = data.schoolName || "Gyanodaya Public School";

    const logoImg = document.getElementById("schoolLogo") || document.querySelector(".logo img");
    if (logoImg && data.logo) {
      logoImg.src = data.logo;
      logoImg.style.display = "block";
    }

    // 2. Update Footer
    const footer = document.getElementById("footer");
    if (footer && data.footer) {
      const f = data.footer;
      footer.innerHTML = `
                <div class="footer-grid">
                    <div>
                        <h4 style="color:var(--accent); margin-bottom:15px;">About Our School</h4>
                        <p style="font-size:14px; opacity:0.8; margin-bottom:20px;">${f.about || ""}</p>
                        <p style="font-size:14px;"><i class="fas fa-map-marker-alt"></i> ${f.address || ""}</p>
                        <p style="font-size:14px;"><i class="fas fa-phone"></i> ${f.phone || ""}</p>
                        <p style="font-size:14px;"><i class="fas fa-envelope"></i> ${f.email || ""}</p>
                    </div>
                    <div>
                        <h4 style="color:var(--accent); margin-bottom:15px;">Quick Links</h4>
                        <ul style="list-style:none; padding:0;">
                            ${(f.quickLinks || []).map(l => `<li><a href="${l.url}" style="font-size:14px; opacity:0.8; display:block; margin-bottom:8px; color:white;">${l.title}</a></li>`).join("")}
                        </ul>
                    </div>
                    <div>
                        <h4 style="color:var(--accent); margin-bottom:15px;">Follow Us</h4>
                        <div class="social-icons" style="display:flex; gap:10px;">
                            ${(f.socials || []).map(s => `
                                <a href="${s.url}" target="_blank" title="${s.name}">
                                    <img src="${s.icon}" alt="${s.name}" style="height:30px; width:30px; transition:0.3s;">
                                </a>
                            `).join("")}
                        </div>
                        <div style="margin-top:20px;">
                             <a href="admin/login.html" style="font-size:12px; opacity:0.4; color:white;">Admin Login</a>
                        </div>
                    </div>
                </div>
                <div style="text-align:center; margin-top:40px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.1); font-size:13px; opacity:0.6;">
                    ${f.copyright || "© 2026 Gyanodaya Public School"}
                </div>
            `;
    }

    // 3. Update Map (if on Home Page)
    const mapFrame = document.getElementById("mapFrame");
    if (mapFrame && data.footer?.mapEmbed) {
      mapFrame.src = data.footer.mapEmbed;
    }

    // 4. Update Hero (if on Home Page)
    const heroTitle = document.getElementById("heroTitle");
    if (heroTitle) heroTitle.innerText = data.heroTitle || "";

    const heroIntro = document.getElementById("heroIntro");
    if (heroIntro) heroIntro.innerText = data.heroIntro || "";

    const badge = document.getElementById("admissionBadge");
    if (badge) badge.style.display = data.admissionOpen ? "block" : "none";

  } catch (err) {
    console.error("Failed to load global settings", err);
  }
}

// Function to load dynamic sections (Home Page only)
window.loadDynamicSections = async function () {
  try {
    const res = await fetch("/api/sections");
    const sections = await res.json();
    const container = document.getElementById("dynamicSections");
    if (!container) return;

    container.innerHTML = "";
    sections
      .filter(s => s.isActive)
      .sort((a, b) => a.position - b.position)
      .forEach(section => {
        let html = `<section class="section"><h2>${section.title}</h2>`;
        if (section.type === "list") {
          html += `<div class="grid">`;
          section.content.forEach(item => {
            html += `<div class="card" style="text-align:center;">
                        <i class="fas fa-check-circle" style="color:var(--primary); font-size:24px; margin-bottom:10px; display:block;"></i>
                        <p>${item}</p>
                    </div>`;
          });
          html += `</div>`;
        } else {
          html += `<div class="card"><p>${section.content.join("<br>")}</p></div>`;
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
      textEl.innerText = notices.map(n => n.text).join("  |  ✦  ");
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
