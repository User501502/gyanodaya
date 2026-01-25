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
  reader.onload = () => {
    logoBase64 = reader.result;
    logoPreview.src = logoBase64;
  };
  reader.readAsDataURL(e.target.files[0]);
};

/* MAP CONVERTER */
function convertToEmbedMap(url) {
  if (!url) return "";
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

  alert("✅ Saved successfully");
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
      <div class="row">
        <input placeholder="Title" value="${l.title}"
          oninput="quickLinks[${i}].title=this.value">
        <input placeholder="URL" value="${l.url}"
          oninput="quickLinks[${i}].url=this.value">
        <button onclick="quickLinks.splice(${i},1);renderQuickLinks()">✕</button>
      </div>`;
  });
}

/* SOCIAL LINKS */
window.addSocial = () => {
  socials.push({
    name: "",
    url: "",
    icon: "" // will hold base64 or URL
  });
  renderSocials();
};

function renderSocials() {
  const box = document.getElementById("socialLinksList");
  box.innerHTML = "";

  socials.forEach((s, i) => {
    box.innerHTML += `
      <div class="social-row">
        <input
          placeholder="Social name (Facebook, Instagram)"
          value="${s.name}"
          oninput="socials[${i}].name=this.value"
        >

        <input
          placeholder="Profile URL"
          value="${s.url}"
          oninput="socials[${i}].url=this.value"
        >

        <input
          placeholder="Icon image URL (optional)"
          value="${s.icon.startsWith('http') ? s.icon : ''}"
          oninput="socials[${i}].icon=this.value"
        >

        <input
          type="file"
          accept="image/*"
          onchange="uploadSocialIcon(event, ${i})"
        >

        ${
          s.icon
            ? `<img src="${s.icon}" class="social-preview">`
            : ""
        }

        <button onclick="socials.splice(${i},1);renderSocials()">❌</button>
      </div>
    `;
  });
}

window.uploadSocialIcon = (e, index) => {
  const file = e.target.files[0];
  if (!file) return;

  toBase64(file, base64 => {
    socials[index].icon = base64; // 🔥 BASE64 SAVED HERE
    renderSocials();              // re-render with preview
  });
};

function toBase64(file, cb) {
  const reader = new FileReader();
  reader.onload = () => cb(reader.result);
  reader.readAsDataURL(file);
}

loadHome();
