/* ================= MOBILE MENU ================= */
function toggleMenu() {
  document.getElementById("navMenu").classList.toggle("active");
}

/* ================= LOAD SETTINGS ================= */
fetch("/api/settings")
  .then(res => res.json())
  .then(s => {
    document.getElementById("schoolName").innerText = s.schoolName;

    // NAV LINKS
    const nav = document.getElementById("navLinks");
    nav.innerHTML = "";
    s.navLinks.forEach(l => {
      nav.innerHTML += `<li><a href="${l.url}">${l.name}</a></li>`;
    });

    // FOOTER
    document.getElementById("footer").innerHTML = `
      <p>
        📍 ${s.address}<br>
        📞 ${s.phones.join(" | ")}<br>
        📧 ${s.email}
      </p>
    `;
  });

/* ================= LOAD HOME CONTENT ================= */
fetch("/api/home")
  .then(res => res.json())
  .then(data => {
    if (!data) return;

    /* ================= HEADER ================= */
  const logoImg = document.getElementById("schoolLogo");
const schoolNameEl = document.getElementById("schoolName");

if (data.logo && logoImg) {
  logoImg.src = data.logo;
  logoImg.style.display = "block";
}

if (schoolNameEl && data.schoolName) {
  schoolNameEl.innerText = data.schoolName;
}

    /* ================= HERO ================= */
    const heroTitle = document.getElementById("heroTitle");
    const heroIntro = document.getElementById("heroIntro");
    const admissionBadge = document.getElementById("admissionBadge");

    if (heroTitle) heroTitle.innerText = data.heroTitle || "";
    if (heroIntro) heroIntro.innerText = data.heroIntro || "";

    if (admissionBadge) {
      admissionBadge.style.display = data.admissionOpen ? "block" : "none";
    }

    /* ================= MAP ================= */
    const mapFrame = document.getElementById("mapFrame");
    if (mapFrame && data.footer?.mapEmbed) {
      mapFrame.src = data.footer.mapEmbed;
    }

    /* ================= FOOTER ================= */
    const footer = document.getElementById("footer");
    if (footer && data.footer) {
      footer.innerHTML = `
        <div class="footer-content">
          ${data.footer.about ? `<p>${data.footer.about}</p>` : ""}

          ${data.footer.address ? `<p><strong>📍 Address:</strong> ${data.footer.address}</p>` : ""}

          ${data.footer.phone ? `<p><strong>📞 Phone:</strong> ${data.footer.phone}</p>` : ""}

          ${data.footer.email ? `<p><strong>📧 Email:</strong> ${data.footer.email}</p>` : ""}

          ${data.footer.copyright
            ? `<small>${data.footer.copyright}</small>`
            : ""}
        </div>
      `;
    }
  })
  .catch(err => {
    console.error("Home API error:", err);
  });

/* ================= LOAD SECTIONS ================= */
fetch("/api/sections")
  .then(res => res.json())
  .then(sections => {
    const container = document.getElementById("dynamicSections");
    container.innerHTML = "";

    sections.forEach(section => {
      let html = `
        <section class="section">
          <h2>${section.title}</h2>
      `;

      /* 🔹 LIST TYPE → MULTIPLE CARDS */
      if (section.type === "list") {
        html += `<div class="section-cards">`;

        section.content.forEach(item => {
          html += `
            <div class="section-card">
              <span>✔</span>
              <p>${item}</p>
            </div>
          `;
        });

        html += `</div>`;
      }

      /* 🔹 TEXT TYPE → SINGLE CARD */
      if (section.type === "text") {
        html += `
          <div class="section-cards">
            <div class="section-card">
              <p>${section.content.join(" ")}</p>
            </div>
          </div>
        `;
      }

      html += `</section>`;
      container.innerHTML += html;
    });
  })
  .catch(() => {
    document.getElementById("dynamicSections").innerHTML =
      "<p>Content loading failed.</p>";
  });

/* ================= LOAD NOTICES ================= */
fetch("/api/notices")
  .then(res => res.json())
  .then(n => {
    if (n.length > 0) {
      document.getElementById("noticeTicker").style.display = "block";
      document.getElementById("noticeText").innerText =
        n.map(x => "📢 " + x.title).join("   |   ");
    }
  });

/* ================= INIT PAGE ================= */
async function initPage() {
  try {
    // Load home + sections in parallel
    const [homeRes, sectionRes] = await Promise.all([
      fetch("/api/home"),
      fetch("/api/sections")
    ]);

    const homeData = await homeRes.json();
    const sections = await sectionRes.json();

    /* ================= HOME CONTENT ================= */
    if (homeData) {
      // School name
      document.getElementById("schoolName").innerText =
        homeData.schoolName || "";

      // Logo
      if (homeData.logo) {
        const logoImg = document.getElementById("schoolLogo");
        logoImg.src = homeData.logo;
        logoImg.style.display = "block";
      }

      // Hero
      document.getElementById("heroTitle").innerText =
        homeData.heroTitle || "";

      document.getElementById("heroIntro").innerText =
        homeData.heroIntro || "";

      document.getElementById("admissionBadge").style.display =
        homeData.admissionOpen ? "block" : "none";

      // Map
      if (homeData.footer?.mapEmbed) {
        document.getElementById("mapFrame").src =
          homeData.footer.mapEmbed;
      }

      // Footer
      if (homeData.footer) {
        document.getElementById("footer").innerHTML = `
          <p>${homeData.footer.about || ""}</p>
          <p>📍 ${homeData.footer.address || ""}</p>
          <p>📞 ${homeData.footer.phone || ""}</p>
          <p>📧 ${homeData.footer.email || ""}</p>
        `;
      }
    }

    /* ================= SECTIONS ================= */
    const container = document.getElementById("dynamicSections");
    container.innerHTML = "";

    sections
      .filter(s => s.isActive)
      .sort((a, b) => a.position - b.position)
      .forEach(section => {
        let html = `<section class="section"><h2>${section.title}</h2>`;

        if (section.type === "list") {
          html += `<ul>${section.content.map(i => `<li>${i}</li>`).join("")}</ul>`;
        } else {
          html += `<p>${section.content.join(" ")}</p>`;
        }

        html += `</section>`;
        container.innerHTML += html;
      });

  } catch (err) {
    console.error("Page load error:", err);
  } finally {
    /* ================= SHOW SITE ================= */
    document.getElementById("pageLoader").style.display = "none";
    document.getElementById("siteContent").style.display = "block";
  }
}

initPage();
