import { api } from "./admin.js";

const form = document.getElementById("sectionForm");
const list = document.getElementById("sectionsList");

let editId = null;
let draggedCard = null;

/* =========================
   LOAD SECTIONS
========================= */
async function loadSections() {
  const sections = await api("/api/sections");
  list.innerHTML = "";

  sections
    .sort((a, b) => a.position - b.position)
    .forEach(section => {
      const card = document.createElement("div");
      card.className = "section-card";
      card.draggable = true;
      card.dataset.id = section._id;

      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${section.title}</strong>
          <span style="cursor:grab">☰</span>
        </div>

        <div class="section-meta">
          ${section.type.toUpperCase()} |
          ${section.isActive ? "Active" : "Inactive"}
        </div>

        <div class="section-actions">
          <button class="btn-edit">Edit</button>
          <button class="btn-delete">Delete</button>
        </div>
      `;

      // EDIT
      card.querySelector(".btn-edit").onclick = () => {
        editId = section._id;
        document.getElementById("title").value = section.title;
        document.getElementById("type").value = section.type;
        document.getElementById("content").value = section.content.join("\n");
        document.getElementById("isActive").checked = section.isActive;
        window.scrollTo({ top: 0, behavior: "smooth" });
      };

      // DELETE
      card.querySelector(".btn-delete").onclick = async () => {
        if (!confirm("Delete this section?")) return;
        await api(`/api/sections?id=${section._id}`, {
          method: "DELETE"
        });
        loadSections();
      };

      // DRAG EVENTS
      card.addEventListener("dragstart", () => {
        draggedCard = card;
        card.classList.add("dragging");
      });

      card.addEventListener("dragend", () => {
        draggedCard = null;
        card.classList.remove("dragging");
        saveOrder();
      });

      card.addEventListener("dragover", e => {
        e.preventDefault();
        const after = getAfterElement(list, e.clientY);
        if (after == null) list.appendChild(draggedCard);
        else list.insertBefore(draggedCard, after);
      });

      list.appendChild(card);
    });
}

/* =========================
   ADD / EDIT SECTION
========================= */
if (form) {
  form.onsubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: title.value.trim(),
      type: type.value,
      content:
        type.value === "list"
          ? content.value.split("\n").map(i => i.trim()).filter(Boolean)
          : [content.value.trim()],
      isActive: isActive.checked,
      position: Date.now()
    };

    if (editId) {
      await api(`/api/sections?id=${editId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      editId = null;
    } else {
      await api("/api/sections", {
        method: "POST",
        body: JSON.stringify(payload)
      });
    }

    form.reset();
    loadSections();
  };
}

/* =========================
   SAVE DRAG ORDER
========================= */
async function saveOrder() {
  const cards = [...list.children];
  for (let i = 0; i < cards.length; i++) {
    await api(`/api/sections?id=${cards[i].dataset.id}`, {
      method: "PUT",
      body: JSON.stringify({ position: i })
    });
  }
}

/* =========================
   DRAG HELPER
========================= */
function getAfterElement(container, y) {
  const els = [...container.querySelectorAll(".section-card:not(.dragging)")];
  return els.reduce((closest, el) => {
    const box = el.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: el };
    }
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/* INIT */
loadSections();
