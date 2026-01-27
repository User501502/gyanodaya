/* ================= MOBILE MENU ================= */
function toggleMenu() {
  document.getElementById("navMenu").classList.toggle("active");
}

/* ================= INIT PAGE ================= */
async function initPage() {
  try {
    const [homeRes, sectionRes] = await Promise.all([
      fetch("/api/home"),
      fetch("/api/sections")
    ]);

    const homeData = await homeRes.json();
    const sections = await sectionRes.json();

    /* ===== HEADER ===== */
    document.getElementById("schoolName").innerText =
      homeData.schoolName || "";

    if (homeData.logo) {
      const logoImg = document.getElementById("schoolLogo");
      logoImg.src = homeData.logo;
      logoImg.style.display = "block";
    }

    /* ===== HERO ===== */
    document.getElementById("heroTitle").innerText =
      homeData.heroTitle || "";

    document.getElementById("heroIntro").innerText =
      homeData.heroIntro || "";

    document.getElementById("admissionBadge").style.display =
      homeData.admissionOpen ? "block" : "none";

    /* ===== MAP ===== */
    if (homeData.footer?.mapEmbed) {
      document.getElementById("mapFrame").src =
        homeData.footer.mapEmbed;
    }

    /* ===== FOOTER ===== */
    if (homeData.footer) {
      const f = homeData.footer;

      document.getElementById("footer").innerHTML = `
    <div class="footer-grid">

      <div>
        <h4>About School</h4>
        <p>${f.about || ""}</p>
        <p>📍 ${f.address || ""}</p>
        <p>📞 ${f.phone || ""}</p>
        <p>📧 ${f.email || ""}</p>
      </div>

      <div>
        <h4>Quick Links</h4>
        <ul>
          ${(f.quickLinks || []).map(l =>
        `<li><a href="${l.url}">${l.title}</a></li>`
      ).join("")}
        </ul>
      </div>

      <div>
        <h4>Follow Us</h4>
        <div class="social-icons">
          ${(f.socials || []).map(s =>
        `<a href="${s.url}" target="_blank">
              <img src="${s.icon}" alt="${s.name}">
            </a>`
      ).join("")}
        </div>
      </div>

    </div>

    <div class="footer-bottom">
      <small>${f.copyright || ""}</small>
    </div>
  `;
    }

    /* ===== SECTIONS (CARDS) ===== */
    const container = document.getElementById("dynamicSections");
    container.innerHTML = "";

    sections
      .filter(s => s.isActive)
      .sort((a, b) => a.position - b.position)
      .forEach(section => {
        let html = `<section class="section"><h2>${section.title}</h2>`;

        if (section.type === "list") {
          html += `<div class="section-cards">`;
          section.content.forEach(item => {
            html += `
              <div class="section-card">
                <span>✔</span>
                <p>${item}</p>
              </div>`;
          });
          html += `</div>`;
        }

        if (section.type === "text") {
          html += `
            <div class="section-cards">
              <div class="section-card">
                <p>${section.content.join(" ")}</p>
              </div>
            </div>`;
        }

        html += `</section>`;
        container.innerHTML += html;
      });

  } catch (e) {
    console.error("Page load error", e);
  } finally {
    document.getElementById("pageLoader").style.display = "none";
    document.getElementById("siteContent").style.display = "block";
  }
}

initPage();
