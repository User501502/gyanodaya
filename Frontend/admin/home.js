import { api } from "./admin.js";

/* =========================
   HERO / HOME SETTINGS
========================= */

const form = document.getElementById("homeForm");

const schoolName = document.getElementById("schoolName");
const heroTitle = document.getElementById("heroTitle");
const heroIntro = document.getElementById("heroIntro");
const admissionOpen = document.getElementById("admissionOpen");

/* LOAD EXISTING HOME DATA */
async function loadHome() {
  const data = await api("/api/home");
  if (!data) return;

  schoolName.value = data.schoolName || "";
  heroTitle.value = data.heroTitle || "";
  heroIntro.value = data.heroIntro || "";
  admissionOpen.checked = data.admissionOpen || false;
}

/* SAVE HERO DATA */
form.onsubmit = async (e) => {
  e.preventDefault();

  await api("/api/home", {
    method: "POST",
    body: JSON.stringify({
      schoolName: schoolName.value.trim(),
      heroTitle: heroTitle.value.trim(),
      heroIntro: heroIntro.value.trim(),
      admissionOpen: admissionOpen.checked
    })
  });

  alert("✅ Hero section updated successfully");
};

/* INIT */
loadHome();

/* =========================
   COLLAPSIBLE BLOCKS
========================= */

window.toggleBlock = function (id) {
  const block = document.getElementById(id);
  const icon = document.getElementById(id + "Icon");

  block.classList.toggle("hidden");
  icon.textContent = block.classList.contains("hidden") ? "+" : "−";
};
