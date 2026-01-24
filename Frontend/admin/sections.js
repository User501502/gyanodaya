import { api } from "./admin.js";

const list = document.getElementById("sectionsList");
const form = document.getElementById("sectionForm");

async function loadSections() {
  const sections = await api("/api/sections");
  list.innerHTML = "";

  sections.forEach(s => {
    const div = document.createElement("div");
    div.textContent = `${s.title} (${s.type})`;
    list.appendChild(div);
  });
}

form.onsubmit = async (e) => {
  e.preventDefault();

  await api("/api/sections", {
    method: "POST",
    body: JSON.stringify({
      title: title.value,
      type: type.value,
      content: content.value.split("\n"),
      position: Date.now(),
      isActive: true
    })
  });

  alert("Section added");
  form.reset();
  loadSections();
};

loadSections();
