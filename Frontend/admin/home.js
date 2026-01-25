import { api } from "./admin.js";

/* ================= GLOBAL STATE ================= */
window.quickLinks = [];
window.socials = [];


/* ================= ELEMENTS ================= */
const schoolName = document.getElementById("schoolName");
const heroTitle = document.getElementById("heroTitle");
const heroIntro = document.getElementById("heroIntro");
const admissionOpen = document.getElementById("admissionOpen");

const footerAbout = document.getElementById("footerAbout");
const footerAddress = document.getElementById("footerAddress");
const footerPhone = document.getElementById("footerPhone");
const footerEmail = document.getElementById("footerEmail");
const footerCopyright = document.getElementById("footerCopyright");
const mapLink = document.getElementById("mapLink");

const logoInput = document.getElementById("logoInput");
const logoPreview = document.getElementById("logoPreview");
const saveBtn = document.getElementById("saveHomeBtn");

let logoBase64 = "";

/* ================= LOAD ================= */
async function loadHome() {
  const data = await api("/api/home");
  if (!data) return;

  schoolName.value = data.schoolName || "";
  heroTitle.value = data.heroTitle || "";
  heroIntro.value = data.heroIntro || "";
  admissionOpen.checked = data.admissionOpen || false;

  const f = data.footer || {};
  footerAbout.value = f.about || "";
  footerAddress.value = f.address || "";
  footerPhone.value = f.phone || "";
  footerEmail.value = f.email || "";
  footerCopyright.value = f.copyright || "";
  mapLink.value = f.mapLink || "";

  window.quickLinks = f.quickLinks || [];
  window.socials = f.socials || [];

  renderQuickLinks();
  renderSocials();

  if (data.logo) {
    logoBase64 = data.logo;
    logoPreview.src = data.logo;
  }
}

/* ================= LOGO ================= */
logoInput.onchange = e => {
  const reader = new FileReader();
  reader.onload = () => {
    logoBase64 = reader.result;
    logoPreview.src = logoBase64;
  };
  reader.readAsDataURL(e.target.files[0]);
};

/* ================= MAP ================= */
function convertToEmbedMap(url) {
  if (!url) return "";

  // If already embed link, just return it
  if (url.includes("google.com/maps/embed")) {
    return url;
  }

  // Try to extract lat, lng from URL
  const latLngMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (latLngMatch) {
    const lat = latLngMatch[1];
    const lng = latLngMatch[2];
    return `https://www.google.com/maps?q=${lat},${lng}&output=embed`;
  }

  // If place format but lat/lng not in string
  const placeMatch = url.match(/\/place\/([^/]+)/);
  if (placeMatch) {
    const place = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    return `https://www.google.com/maps?q=${encodeURIComponent(place)}&output=embed`;
  }

  // Fallback to search
  return `https://www.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
}

/* ================= SAVE ================= */
saveBtn.onclick = async () => {
  await api("/api/home", {
    method: "POST",
    body: JSON.stringify({
      schoolName: schoolName.value,
      logo: logoBase64,
      heroTitle: heroTitle.value,
      heroIntro: heroIntro.value,
      admissionOpen: admissionOpen.checked,
      footer: {
        about: footerAbout.value,
        address: footerAddress.value,
        phone: footerPhone.value,
        email: footerEmail.value,
        mapLink: mapLink.value,
        mapEmbed: convertToEmbedMap(mapLink.value),
        quickLinks: window.quickLinks,
        socials: window.socials,
        copyright: footerCopyright.value
      }
    })
  });

  alert("✅ Home page saved successfully");
};

/* ================= QUICK LINKS ================= */
window.addQuickLink = () => {
  window.quickLinks.push({ title: "", url: "" });
  renderQuickLinks();
};

function renderQuickLinks() {
  const box = document.getElementById("quickLinksList");
  box.innerHTML = "";

  window.quickLinks.forEach((l, i) => {
    box.innerHTML += `
      <div class="row">
        <input placeholder="Title" value="${l.title}"
          oninput="window.quickLinks[${i}].title=this.value">
        <input placeholder="URL" value="${l.url}"
          oninput="window.quickLinks[${i}].url=this.value">
        <button onclick="window.quickLinks.splice(${i},1);renderQuickLinks()">✕</button>
      </div>
    `;
  });
}

window.renderQuickLinks = renderQuickLinks;

/* ================= SOCIAL LINKS ================= */
window.addSocial = () => {
  window.socials.push({ name: "", url: "", icon: "" });
  renderSocials();
};

window.renderSocials = function () {
  const box = document.getElementById("socialLinksList");
  box.innerHTML = "";

  window.socials.forEach((s, i) => {
    box.innerHTML += `
      <div class="social-row">
        <input value="${s.name}"
          oninput="window.socials[${i}].name=this.value">

        <input value="${s.url}"
          oninput="window.socials[${i}].url=this.value">

        <input value="${s.icon.startsWith('http') ? s.icon : ''}"
          oninput="window.socials[${i}].icon=this.value">

        <input type="file"
          onchange="uploadSocialIcon(event, ${i})">

        ${s.icon ? `<img src="${s.icon}" class="social-preview">` : ""}

        <button onclick="window.socials.splice(${i},1);renderSocials()">❌</button>
      </div>
    `;
  });
};


/* ================= BASE64 UPLOAD ================= */
window.uploadSocialIcon = (e, index) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    window.socials[index].icon = reader.result;
    renderSocials();
  };
  reader.readAsDataURL(file);
};

/* ================= SECTIONS ================= */

let sections = [];
let editingSectionId = null;

// LOAD sections
async function loadSections() {
  sections = await api("/api/sections") || [];
  renderSections();
}

// RENDER
function renderSections() {
  const box = document.getElementById("sectionsList");
  box.innerHTML = "";

  sections
    .sort((a, b) => a.position - b.position)
    .forEach(sec => {
      box.innerHTML += `
        <div class="drag-item" draggable="true" data-id="${sec._id}">
          <div>
            <strong>${sec.title}</strong>
            <div class="section-meta">
              ${sec.type} • ${sec.isActive ? "Active" : "Inactive"}
            </div>
          </div>
          <div>
            <button onclick="editSection('${sec._id}')">✏️</button>
            <button onclick="deleteSection('${sec._id}')">🗑</button>
          </div>
        </div>
      `;
    });

  enableDrag();
}

// ADD / UPDATE
document.getElementById("sectionForm").onsubmit = async e => {
  e.preventDefault();

  const payload = {
    title: sectionTitle.value,
    type: sectionType.value,
    content: sectionContent.value.split("\n"),
    isActive: sectionActive.checked
  };

  if (editingSectionId) {
    await api(`/api/sections/${editingSectionId}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
  } else {
    await api("/api/sections", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  editingSectionId = null;
  sectionForm.reset();
  loadSections();
};

// EDIT
window.editSection = id => {
  const s = sections.find(x => x._id === id);
  if (!s) return;

  sectionTitle.value = s.title;
  sectionType.value = s.type;
  sectionContent.value = s.content.join("\n");
  sectionActive.checked = s.isActive;
  editingSectionId = id;
};

// DELETE
window.deleteSection = async id => {
  if (!confirm("Delete section?")) return;
  await api(`/api/sections/${id}`, { method: "DELETE" });
  loadSections();
};

// DRAG REORDER
function enableDrag() {
  let dragged;

  document.querySelectorAll(".drag-item").forEach(item => {
    item.ondragstart = () => dragged = item;
    item.ondragover = e => e.preventDefault();
    item.ondrop = () => {
      if (dragged === item) return;
      item.before(dragged);

      const ids = [...document.querySelectorAll(".drag-item")]
        .map((el, i) => ({ id: el.dataset.id, position: i }));

      api("/api/sections/reorder", {
        method: "POST",
        body: JSON.stringify(ids)
      });
    };
  });
}

// INIT
loadSections();

/* INIT */
loadHome();
