import { api } from "./admin.js";

const form = document.getElementById("homeForm");
const introText = document.getElementById("introText");
const admissionOpen = document.getElementById("admissionOpen");

async function load() {
  const data = await api("/api/home");
  if (!data) return;

  introText.value = data.intro || "";
  admissionOpen.checked = data.admissionOpen || false;
}

form.onsubmit = async (e) => {
  e.preventDefault();

  await api("/api/home", {
    method: "POST",
    body: JSON.stringify({
      intro: introText.value,
      admissionOpen: admissionOpen.checked
    })
  });

  alert("Home page updated");
};

load();
