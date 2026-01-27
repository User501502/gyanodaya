import { protectPage, initSidebar, api } from "./admin.js";

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
  } catch (err) {
    console.error("Load failed", err);
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

/* ================= MAP HELPER ================= */
function convertToEmbedMap(url) {
  if (!url) return "";
  if (url.includes("output=embed")) return url;

  // Simplistic extraction for common Google Maps links
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
    alert("✅ Home page settings saved successfully!");
  } catch (err) {
    alert("❌ Error: " + err.message);
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Save All Changes';
  }
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
    const div = document.createElement("div");
    div.className = "social-row";
    div.innerHTML = `
            <input placeholder="Title" value="${l.title}" oninput="window.quickLinks[${i}].title=this.value">
            <input placeholder="URL" value="${l.url}" oninput="window.quickLinks[${i}].url=this.value">
            <button class="btn btn-danger" onclick="window.quickLinks.splice(${i},1);renderQuickLinks()"><i class="fas fa-trash"></i></button>
        `;
    box.appendChild(div);
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
    const div = document.createElement("div");
    div.className = "card";
    div.style.padding = "15px";
    div.style.marginBottom = "10px";
    div.innerHTML = `
            <div class="social-row">
                <input value="${s.name}" placeholder="Platform Name (e.g. Facebook)" oninput="window.socials[${i}].name=this.value">
                <input value="${s.url}" placeholder="URL" oninput="window.socials[${i}].url=this.value">
                <button class="btn btn-danger" onclick="window.socials.splice(${i},1);renderSocials()"><i class="fas fa-trash"></i></button>
            </div>
            <div style="display: flex; align-items: center; gap: 15px; margin-top: 10px;">
                <input type="file" onchange="uploadSocialIcon(event, ${i})" style="flex: 1;">
                ${s.icon ? `<img src="${s.icon}" class="social-preview" style="height:32px; width:32px; object-fit:contain;">` : ""}
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
    renderSocials();
  };
  reader.readAsDataURL(file);
};

init();
