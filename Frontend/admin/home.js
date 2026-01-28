import { protectPage, initSidebar, api } from "./admin.js";

/* ================= GLOBAL STATE ================= */
window.quickLinks = [];
window.socials = [];
let logoBase64 = "";
let heroBase64 = "";

/* ================= ELEMENTS ================= */
const schoolName = document.getElementById("schoolName");
const heroTitle = document.getElementById("heroTitle");
const heroIntro = document.getElementById("heroIntro");
const admissionOpen = document.getElementById("admissionOpen");
const admissionYear = document.getElementById("admissionYear");

const footerAbout = document.getElementById("footerAbout");
const footerAddress = document.getElementById("footerAddress");
const footerPhone = document.getElementById("footerPhone");
const footerEmail = document.getElementById("footerEmail");
const footerCopyright = document.getElementById("footerCopyright");
const mapLink = document.getElementById("mapLink");

const logoInput = document.getElementById("logoInput");
const logoPreview = document.getElementById("logoPreview");
const heroInput = document.getElementById("heroInput");
const saveBtn = document.getElementById("saveHomeBtn");

/* ================= INIT ================= */
async function init() {
  await protectPage();
  initSidebar();
  await loadHome();
}

/* ================= LOAD ================= */
async function loadHome() {
  try {
    const data = await api("/api/home");
    if (!data) return;

    schoolName.value = data.schoolName || "";
    heroTitle.value = data.heroTitle || "";
    heroIntro.value = data.heroIntro || "";
    admissionOpen.checked = data.admissionOpen || false;
    admissionYear.value = data.admissionYear || "2024-25";

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
      logoPreview.style.display = "block";
    }
    if (data.heroImage) {
      heroBase64 = data.heroImage;
    }
  } catch (err) {
    console.error("Load failed", err);
  }
}

/* ================= FILE UPLOADS ================= */
logoInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    logoBase64 = reader.result;
    logoPreview.src = logoBase64;
    logoPreview.style.display = "block";
  };
  reader.readAsDataURL(file);
};

heroInput.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    heroBase64 = reader.result;
  };
  reader.readAsDataURL(file);
};

/* ================= MAP HELPER ================= */
function convertToEmbedMap(url) {
  if (!url) return "";
  if (url.includes("google.com/maps/embed")) return url;

  const srcMatch = url.match(/src="([^"]+)"/);
  if (srcMatch) return srcMatch[1];

  const cidMatch = url.match(/!1s([^!]+)/);
  if (cidMatch) return `https://www.google.com/maps?cid=${cidMatch[1]}&output=embed`;

  return `https://www.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
}

/* ================= SAVE ================= */
saveBtn.onclick = async () => {
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    await api("/api/home", {
      method: "POST",
      body: JSON.stringify({
        schoolName: schoolName.value,
        logo: logoBase64,
        heroTitle: heroTitle.value,
        heroIntro: heroIntro.value,
        heroImage: heroBase64,
        admissionOpen: admissionOpen.checked,
        admissionYear: admissionYear.value,
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
    alert("✅ Home page settings saved successfully!");
  } catch (err) {
    alert("❌ Error: " + err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save All Changes';
  }
};

/* ================= LIST MGMT ================= */
window.addQuickLink = () => {
  window.quickLinks.push({ title: "", url: "" });
  renderQuickLinks();
};

function renderQuickLinks() {
  const box = document.getElementById("quickLinksList");
  box.innerHTML = "";
  window.quickLinks.forEach((l, i) => {
    const div = document.createElement("div");
    div.className = "social-row";
    div.style.marginBottom = "10px";
    div.innerHTML = `
            <input placeholder="Title" value="${l.title}" oninput="window.quickLinks[${i}].title=this.value" style="flex:1;">
            <input placeholder="URL" value="${l.url}" oninput="window.quickLinks[${i}].url=this.value" style="flex:2;">
            <button class="btn btn-danger" onclick="window.quickLinks.splice(${i},1);renderQuickLinks()">
                <i class="fas fa-trash"></i>
            </button>
        `;
    box.appendChild(div);
  });
}
window.renderQuickLinks = renderQuickLinks;

window.addSocial = () => {
  window.socials.push({ name: "", url: "", icon: "" });
  renderSocials();
};

window.renderSocials = function () {
  const box = document.getElementById("socialLinksList");
  box.innerHTML = "";
  window.socials.forEach((s, i) => {
    const div = document.createElement("div");
    div.className = "card";
    div.style.padding = "15px";
    div.style.marginBottom = "15px";
    div.style.background = "#fafafa";
    div.innerHTML = `
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                <input value="${s.name}" placeholder="Platform (e.g. Facebook)" oninput="window.socials[${i}].name=this.value" style="flex:1;">
                <input value="${s.url}" placeholder="Profile URL" oninput="window.socials[${i}].url=this.value" style="flex:2;">
                <button class="btn btn-danger" onclick="window.socials.splice(${i},1);renderSocials()">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="flex:1;">
                    <label style="font-size:12px; display:block; margin-bottom:5px;">Platform Icon (Logo)</label>
                    <input type="file" accept="image/*" onchange="window.uploadSocialIcon(event, ${i})">
                </div>
                ${s.icon ? `<img src="${s.icon}" style="height:40px; width:40px; object-fit:contain; border:1px solid #ddd; padding:2px; background:white;">` : ""}
            </div>
        `;
    box.appendChild(div);
  });
};

window.uploadSocialIcon = (e, index) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    window.socials[index].icon = reader.result;
    window.renderSocials();
  };
  reader.readAsDataURL(file);
};

init();
