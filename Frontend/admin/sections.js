import { protectPage, initSidebar, api } from "./admin.js";

const form = document.getElementById("sectionForm");
const list = document.getElementById("sectionsList");
const cancelBtn = document.getElementById("cancelEdit");
const formTitle = document.getElementById("formTitle");

let editId = null;
let draggedCard = null;

async function init() {
  await protectPage();
  initSidebar();
  await loadSections();
}

async function loadSections() {
  try {
    const sections = await api("/api/sections");
    list.innerHTML = "";

    if (sections.length === 0) {
      list.innerHTML = "<p>No sections created yet.</p>";
      return;
    }

    sections
      .sort((a, b) => a.position - b.position)
      .forEach(section => {
        const card = document.createElement("div");
        card.className = `section-card ${section.isActive ? "" : "inactive"}`;
        card.draggable = true;
        card.dataset.id = section._id;

        card.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:start">
                        <div>
                            <h4 style="margin:0">${section.title}</h4>
                            <div class="section-meta">${section.type.toUpperCase()}</div>
                        </div>
                        <span style="cursor:grab; color: var(--text-muted); font-size: 20px;">☰</span>
                    </div>
                    <div style="margin-top: 15px; display: flex; gap: 8px;">
                        <button class="btn btn-secondary btn-sm edit-btn" style="padding: 5px 10px; font-size: 12px;">Edit</button>
                        <button class="btn btn-danger btn-sm del-btn" style="padding: 5px 10px; font-size: 12px;">Delete</button>
                    </div>
                `;

        card.querySelector(".edit-btn").onclick = () => startEdit(section);
        card.querySelector(".del-btn").onclick = () => deleteSection(section._id);

        // Drag logic
        card.addEventListener("dragstart", () => {
          draggedCard = card;
          card.style.opacity = "0.4";
        });
        card.addEventListener("dragend", () => {
          draggedCard = null;
          card.style.opacity = "1";
          saveOrder();
        });
        card.addEventListener("dragover", e => {
          e.preventDefault();
          const afterElement = getDragAfterElement(list, e.clientY);
          if (afterElement == null) {
            list.appendChild(draggedCard);
          } else {
            list.insertBefore(draggedCard, afterElement);
          }
        });

        list.appendChild(card);
      });
  } catch (err) {
    list.innerHTML = `<p style="color:red">Error: ${err.message}</p>`;
  }
}

function startEdit(s) {
  editId = s._id;
  document.getElementById("title").value = s.title;
  document.getElementById("type").value = s.type;
  document.getElementById("content").value = s.content.join("\n");
  document.getElementById("isActive").checked = s.isActive;
  formTitle.textContent = "Edit Section";
  cancelBtn.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

cancelBtn.onclick = () => {
  editId = null;
  form.reset();
  formTitle.textContent = "Add New Section";
  cancelBtn.classList.add("hidden");
};

form.onsubmit = async (e) => {
  e.preventDefault();
  const btn = form.querySelector("button[type='submit']");
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  const payload = {
    title: document.getElementById("title").value.trim(),
    type: document.getElementById("type").value,
    content: document.getElementById("content").value.split("\n").map(i => i.trim()).filter(Boolean),
    isActive: document.getElementById("isActive").checked
  };

  try {
    if (editId) {
      await api(`/api/sections?id=${editId}`, { method: "PUT", body: JSON.stringify(payload) });
    } else {
      await api("/api/sections", { method: "POST", body: JSON.stringify(payload) });
    }
    form.reset();
    cancelBtn.onclick();
    loadSections();
  } catch (err) {
    alert("Error: " + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
};

async function deleteSection(id) {
  if (!confirm("Are you sure you want to delete this section?")) return;
  try {
    await api(`/api/sections?id=${id}`, { method: "DELETE" });
    loadSections();
  } catch (err) {
    alert(err.message);
  }
}

async function saveOrder() {
  const cards = [...list.children];
  const order = cards.map((c, i) => ({ id: c.dataset.id, position: i }));
  // We send them sequentially or as one batch if the API supports it
  // Our existing API handles PUT by ID. Let's do them in parallel.
  try {
    await Promise.all(order.map(item =>
      api(`/api/sections?id=${item.id}`, { method: "PUT", body: JSON.stringify({ position: item.position }) })
    ));
  } catch (err) {
    console.error("Failed to save order", err);
  }
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll(".section-card:not(.dragging)")];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

init();
