import { api } from "./admin.js";

/* =========================
   ELEMENTS
========================= */
const schoolName = document.getElementById("schoolName");
const heroTitle = document.getElementById("heroTitle");
const heroIntro = document.getElementById("heroIntro");
const admissionOpen = document.getElementById("admissionOpen");

const footerAbout = document.getElementById("footerAbout");
const footerAddress = document.getElementById("footerAddress");
const footerPhone = document.getElementById("footerPhone");
const footerEmail = document.getElementById("footerEmail");
const footerCopyright = document.getElementById("footerCopyright");

const logoInput = document.getElementById("logoInput");
const logoPreview = document.getElementById("logoPreview");
const saveBtn = document.getElementById("saveHomeBtn");
const mapLink = document.getElementById("mapLink");

let logoBase64 = "";

/* =========================
   LOAD HOME DATA
========================= */
async function loadHome() {
  const data = await api("/api/home");
  if (!data) return;

  schoolName.value = data.schoolName || "";
  heroTitle.value = data.heroTitle || "";
  heroIntro.value = data.heroIntro || "";
  admissionOpen.checked = data.admissionOpen || false;

  footerAbout.value = data.footer?.about || "";
  footerAddress.value = data.footer?.address || "";
  footerPhone.value = data.footer?.phone || "";
  footerEmail.value = data.footer?.email || "";
  footerCopyright.value = data.footer?.copyright || "";

  if (data.logo) {
    logoBase64 = data.logo;
    logoPreview.src = data.logo;
  }
}

/* =========================
   LOGO UPLOAD
========================= */
logoInput.onchange = () => {
  const file = logoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    logoBase64 = reader.result;
    logoPreview.src = logoBase64;
  };
  reader.readAsDataURL(file);
};

/* =========================
   SAVE HOME
========================= */
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
        copyright: footerCopyright.value,
        mapLink: mapLink.value,
        mapEmbed: convertToEmbedMap(mapLink.value)
      }
    })
  });

  alert("✅ Home page fully updated");
};

/* =========================
   COLLAPSIBLE BLOCKS
========================= */
window.toggleBlock = function (id) {
  const block = document.getElementById(id);
  const icon = document.getElementById(id + "Icon");
  block.classList.toggle("hidden");
  icon.textContent = block.classList.contains("hidden") ? "+" : "−";
};

function convertToEmbedMap(url) {
  if (!url) return "";

  // If already embed link, return as is
  if (url.includes("google.com/maps/embed")) {
    return url;
  }

  // Convert normal Google Maps link to embed
  const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);

  if (match) {
    const lat = match[1];
    const lng = match[2];
    return `https://www.google.com/maps?q=${lat},${lng}&output=embed`;
  }

  // fallback: place search
  return `https://www.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
}

/* INIT */
loadHome();
