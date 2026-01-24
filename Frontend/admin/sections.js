import { api } from "./admin.js";

// DOM references
const form = document.getElementById("sectionForm");
const list = document.getElementById("sectionsList");

// Load sections
async function loadSections() {
  const sections = await api("/api/sections");
  list.innerHTML = "";

  sections.forEach(sec => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${sec.title}</strong> (${sec.type})
    `;
    list.appendChild(div);
  });
}

// ✅ SAFE form submit (NO crash)
if (form) {
  form.onsubmit = async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const type = document.getElementById("type").value;
    const content = document
      .getElementById("content")
      .value
      .split("\n")
      .filter(Boolean);

    await api("/api/sections", {
      method: "POST",
      body: JSON.stringify({
        title,
        type,
        content,
        position: Date.now(),
        isActive: true
      })
    });

    alert("Section added successfully");
    form.reset();
    loadSections();
  };
}

// Init
loadSections();
