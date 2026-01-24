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
    const schoolNameEl = document.getElementById("schoolName");
    if (schoolNameEl && data.schoolName) {
      schoolNameEl.innerText = data.schoolName;
    }

    // LOGO
    if (data.logo) {
      const logoBox = document.querySelector(".logo");
      if (logoBox) {
        logoBox.innerHTML = `<img src="${data.logo}" alt="School Logo">`;
      }
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

