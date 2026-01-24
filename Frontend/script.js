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
    document.getElementById("schoolName").innerText = data.schoolName;
    document.getElementById("heroTitle").innerText = data.heroTitle;
    document.getElementById("heroIntro").innerText = data.heroIntro;

    document.getElementById("admissionBadge").style.display =
      data.admissionOpen ? "block" : "none";

    const container = document.getElementById("dynamicSections");
    container.innerHTML = "";

    data.sections
      .filter(s => s.enabled)
      .sort((a, b) => a.order - b.order)
      .forEach(s => {
        const sec = document.createElement("section");
        sec.className = "section";
        sec.innerHTML = `<h2>${s.title}</h2><p>${s.content}</p>`;
        container.appendChild(sec);
      });
  });

  fetch("/api/home")
  .then(res => res.json())
  .then(data => {
    if (data.mapEmbed) {
      document.getElementById("mapFrame").src = data.mapEmbed;
    }
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

