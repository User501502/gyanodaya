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
  .then(h => {
    document.getElementById("heroIntro").innerText = h.intro;

    if (h.admissionOpen) {
      document.getElementById("admissionBadge").style.display = "inline-block";
    }
  });

/* ================= LOAD SECTIONS ================= */
fetch("/api/sections")
  .then(res => res.json())
  .then(sections => {
    const box = document.getElementById("dynamicSections");

    sections.forEach(s => {
      let html = `<section class="section"><h2>${s.title}</h2>`;

      if (s.type === "list") {
        html += "<ul>";
        s.content.forEach(i => html += `<li>${i}</li>`);
        html += "</ul>";
      } else {
        html += `<p>${s.content.join(" ")}</p>`;
      }

      html += "</section>";
      box.innerHTML += html;
    });
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
