import { api } from "./admin.js";

/* ELEMENTS */
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
let quickLinks = [];
let socials = [];

/* LOAD */
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

  quickLinks = f.quickLinks || [];
  socials = f.socials || [];

  renderQuickLinks();
  renderSocials();

  if (data.logo) {
    logoBase64 = data.logo;
    logoPreview.src = data.logo;
  }
}

/* LOGO */
logoInput.onchange = e => {
  const reader = new FileReader();
  reader.onload = () => logoPreview.src = logoBase64 = reader.result;
  reader.readAsDataURL(e.target.files[0]);
};

/* MAP CONVERTER */
function convertToEmbedMap(url) {
  if (!url) return "";
  if (url.includes("embed")) return url;
  return `https://www.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
}

/* SAVE */
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
        quickLinks,
        socials,
        copyright: footerCopyright.value
      }
    })
  });

  alert("✅ Home page saved");
};

/* QUICK LINKS */
window.addQuickLink = () => {
  quickLinks.push({ title: "", url: "" });
  renderQuickLinks();
};

function renderQuickLinks() {
  const box = document.getElementById("quickLinksList");
  box.innerHTML = "";
  quickLinks.forEach((l, i) => {
    box.innerHTML += `
      <div>
        <input value="${l.title}" placeholder="Title"
          onchange="quickLinks[${i}].title=this.value">
        <input value="${l.url}" placeholder="URL"
          onchange="quickLinks[${i}].url=this.value">
        <button onclick="quickLinks.splice(${i},1);renderQuickLinks()">❌</button>
      </div>`;
  });
}

/* SOCIALS */
window.addSocial = () => {
  socials.push({ name: "", url: "", icon: "" });
  renderSocials();
};

function renderSocials() {
  const box = document.getElementById("socialLinksList");
  box.innerHTML = "";
  socials.forEach((s, i) => {
    box.innerHTML += `
      <div>
        <input value="${s.name}" placeholder="Name"
          onchange="socials[${i}].name=this.value">
        <input value="${s.url}" placeholder="Profile URL"
          onchange="socials[${i}].url=this.value">
        <input placeholder="Icon URL"
          onchange="socials[${i}].icon=this.value">
        <input type="file" onchange="uploadSocial(event,${i})">
        ${s.icon ? `<img src="${s.icon}" height="24">` : ""}
        <button onclick="socials.splice(${i},1);renderSocials()">❌</button>
      </div>`;
  });
}

window.uploadSocial = (e, i) => {
  const reader = new FileReader();
  reader.onload = () => {
    socials[i].icon = reader.result;
    renderSocials();
  };
  reader.readAsDataURL(e.target.files[0]);
};

/* COLLAPSE */
window.toggleBlock = id => {
  const b = document.getElementById(id);
  const i = document.getElementById(id + "Icon");
  b.classList.toggle("hidden");
  i.textContent = b.classList.contains("hidden") ? "+" : "−";
};

loadHome();
