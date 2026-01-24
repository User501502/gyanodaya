import { protectPage, api } from "./admin.js";
import { toast } from "./toast.js";

protectPage();

const list = document.getElementById("sectionsList");
const modal = document.getElementById("sectionModal");

let editingId = null;

async function loadSections() {
  const sections = await api("/api/sections");
  list.innerHTML = "";

  sections
    .sort((a,b) => a.position - b.position)
    .forEach(sec => {
      const div = document.createElement("div");
      div.innerHTML = `
        <b>${sec.title}</b>
        (${sec.type})
        <input type="checkbox" ${sec.isActive ? "checked":""}>
        <button data-id="${sec._id}">Edit</button>
      `;
      list.appendChild(div);
    });
}

document.getElementById("addSection").onclick = () => {
  editingId = null;
  modal.classList.remove("hidden");
};

document.getElementById("saveSection").onclick = async () => {
  const data = {
    title: title.value,
    type: type.value,
    content: type.value === "list"
      ? content.value.split("\n")
      : [content.value],
    isActive: isActive.checked
  };

  if (editingId) {
    await api(`/api/sections?id=${editingId}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
    toast("Section updated");
  } else {
    await api("/api/sections", {
      method: "POST",
      body: JSON.stringify(data)
    });
    toast("Section added");
  }

  modal.classList.add("hidden");
  loadSections();
};

loadSections();
