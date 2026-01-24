import { api } from "./admin.js";

// DOM references
const form = document.getElementById("sectionForm");
const list = document.getElementById("sectionsList");

// Load sections
async function loadSections() {
  const sections = await api("/api/sections");
  list.innerHTML = "";

  sections.forEach(section => {
    const card = document.createElement("div");
    card.className = "section-card" + (section.isActive ? "" : " inactive");

    // Header
    card.innerHTML = `
      <h4>${section.title}</h4>
      <div class="section-meta">
        Type: ${section.type.toUpperCase()} |
        Status: ${section.isActive ? "Active" : "Inactive"}
      </div>
    `;

    // CONTENT RENDERING
    if (section.type === "list") {
      section.content.forEach(item => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "list-item-card";
        itemDiv.textContent = item;
        card.appendChild(itemDiv);
      });
    } else {
      const textDiv = document.createElement("div");
      textDiv.className = "list-item-card";
      textDiv.textContent = section.content.join(" ");
      card.appendChild(textDiv);
    }

    list.appendChild(card);
  });
}

// FORM SUBMIT (SAFE)
if (form) {
  form.onsubmit = async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const type = document.getElementById("type").value;
    const contentRaw = document.getElementById("content").value;

    const content =
      type === "list"
        ? contentRaw.split("\n").map(i => i.trim()).filter(Boolean)
        : [contentRaw.trim()];

    await api("/api/sections", {
      method: "POST",
      body: JSON.stringify({
        title,
        type,
        content,
        position: Date.now(),
        isActive: document.getElementById("isActive").checked
      })
    });

    alert("Section added successfully");
    form.reset();
    loadSections();
  };
}

// INIT
loadSections();

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
