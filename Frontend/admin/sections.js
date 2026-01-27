import { protectPage, initSidebar, api } from "./admin.js";

const listContainer = document.getElementById("sectionsList");
const pageFilter = document.getElementById("pageFilter");
const modal = document.getElementById("sectionModal");
const form = document.getElementById("sectionForm");

const imageInput = document.getElementById("sectionImageInput");
const imagePreview = document.getElementById("imagePreview");
const imageBase64 = document.getElementById("sectionImageBase64");

async function init() {
  await protectPage();
  initSidebar();

  // Use page from query param if available
  const urlParams = new URLSearchParams(window.location.search);
  const pageParam = urlParams.get('page');
  if (pageParam) {
    pageFilter.value = pageParam;
    const pageName = pageFilter.options[pageFilter.selectedIndex]?.text || pageParam;
    document.querySelector('h1').innerText = `Manage ${pageName}`;
  }

  loadSections();
}

imageInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    imageBase64.value = reader.result;
    imagePreview.src = reader.result;
    imagePreview.style.display = "block";
  };
  reader.readAsDataURL(file);
};

pageFilter.onchange = () => loadSections();

async function loadSections() {
  try {
    const page = pageFilter.value;
    const sections = await api(`/api/sections?page=${page}`);
    listContainer.innerHTML = "";

    if (sections.length === 0) {
      listContainer.innerHTML = `<div class="card" style="text-align:center; padding:50px; color:var(--text-muted);">
            No sections found for this page. Add your first section to get started!
        </div>`;
      return;
    }

    sections.forEach((s) => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.marginBottom = "15px";
      card.style.display = "flex";
      card.style.justifyContent = "space-between";
      card.style.alignItems = "center";
      card.style.borderLeft = s.isActive ? "5px solid var(--primary)" : "5px solid #ccc";

      card.innerHTML = `
                <div style="display: flex; gap: 15px; align-items: center;">
                    ${s.image ? `<img src="${s.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` : `<div style="width: 50px; height: 50px; background: #f8fafc; border: 1px dashed #ddd; display: flex; align-items: center; justify-content: center; font-size: 20px; color: #cbd5e1;"><i class="fas fa-image"></i></div>`}
                    <div>
                        <h4 style="margin-bottom:5px;">${s.title}</h4>
                        <span class="badge" style="background:#f1f5f9; color:#64748b; font-size:10px;">${s.type.toUpperCase()}</span>
                        <span class="badge" style="background:${s.isActive ? '#dcfce7' : '#fee2e2'}; color:${s.isActive ? '#166534' : '#991b1b'}; font-size:10px;">
                            ${s.isActive ? 'Active' : 'Hidden'}
                        </span>
                    </div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn btn-secondary btn-sm" onclick="editSection('${s._id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm" onclick="deleteSection('${s._id}')"><i class="fas fa-trash"></i></button>
                </div>
            `;
      listContainer.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}

window.showAddSection = () => {
  form.reset();
  document.getElementById("editId").value = "";
  imageBase64.value = "";
  imagePreview.style.display = "none";
  const pageValue = pageFilter.value;
  document.getElementById("sectionPage").value = pageValue;
  document.getElementById("sectionPageDisplay").value = pageValue.toUpperCase();
  document.getElementById("modalTitle").innerText = `Add Section to ${pageValue.toUpperCase()}`;
  toggleContentInputs();
  modal.style.display = "flex";
};

window.closeModal = () => {
  modal.style.display = "none";
};

window.toggleContentInputs = () => {
  const type = document.getElementById("sectionType").value;
  document.getElementById("textContentArea").style.display = type === "text" ? "block" : "none";
  document.getElementById("listContentArea").style.display = type === "list" ? "block" : "none";
};

form.onsubmit = async (e) => {
  e.preventDefault();
  const id = document.getElementById("editId").value;
  const type = document.getElementById("sectionType").value;

  const payload = {
    page: document.getElementById("sectionPage").value,
    title: document.getElementById("sectionTitle").value,
    type: type,
    image: imageBase64.value,
    isActive: document.getElementById("sectionActive").value === "true",
    content: type === "text"
      ? [document.getElementById("sectionText").value]
      : document.getElementById("sectionList").value.split('\n').filter(l => l.trim())
  };

  try {
    if (id) {
      await api(`/api/sections?id=${id}`, { method: "PUT", body: JSON.stringify(payload) });
    } else {
      await api("/api/sections", { method: "POST", body: JSON.stringify(payload) });
    }
    closeModal();
    loadSections();
  } catch (err) { alert(err.message); }
};

window.editSection = async (id) => {
  try {
    const page = pageFilter.value;
    const sections = await api(`/api/sections?page=${page}`);
    const s = sections.find(x => x._id === id);
    if (!s) return;

    document.getElementById("editId").value = s._id;
    document.getElementById("sectionPage").value = s.page || "home";
    document.getElementById("sectionPageDisplay").value = (s.page || "home").toUpperCase();
    document.getElementById("sectionTitle").value = s.title;
    document.getElementById("sectionType").value = s.type;
    document.getElementById("sectionActive").value = s.isActive.toString();

    imageBase64.value = s.image || "";
    if (s.image) {
      imagePreview.src = s.image;
      imagePreview.style.display = "block";
    } else {
      imagePreview.style.display = "none";
    }

    if (s.type === "text") {
      document.getElementById("sectionText").value = s.content[0] || "";
    } else {
      document.getElementById("listContentArea").style.display = "block";
      document.getElementById("textContentArea").style.display = "none";
      document.getElementById("sectionList").value = (s.content || []).join('\n');
    }

    document.getElementById("modalTitle").innerText = "Edit Section";
    toggleContentInputs();
    modal.style.display = "flex";
  } catch (err) { alert(err.message); }
};

window.deleteSection = async (id) => {
  if (!confirm("Delete this section?")) return;
  try {
    await api(`/api/sections?id=${id}`, { method: "DELETE" });
    loadSections();
  } catch (err) { alert(err.message); }
};

init();
