import { protectPage, initSidebar, api } from "./admin.js";

const form = document.getElementById("noticeForm");
const input = document.getElementById("noticeText");
const list = document.getElementById("noticeList");

async function init() {
  await protectPage();
  initSidebar();
  await loadNotices();
}

async function loadNotices() {
  try {
    const notices = await api("/api/notices");
    list.innerHTML = "";

    if (notices.length === 0) {
      list.innerHTML = "<p style='color: var(--text-muted);'>No active notices.</p>";
      return;
    }

    notices.forEach(n => {
      const div = document.createElement("div");
      div.className = "card";
      div.style.padding = "15px";
      div.style.marginBottom = "10px";
      div.style.display = "flex";
      div.style.justifyContent = "space-between";
      div.style.alignItems = "center";
      div.style.borderLeft = "4px solid var(--primary)";

      div.innerHTML = `
                <span style="font-size: 14px; font-weight: 500;">${n.title}</span>
                <button class="btn btn-danger btn-sm" onclick="deleteNotice('${n._id}')" style="padding: 5px 10px;">
                   <i class="fas fa-trash"></i>
                </button>
            `;
      list.appendChild(div);
    });
  } catch (err) {
    console.error(err);
  }
}

form.onsubmit = async (e) => {
  e.preventDefault();
  const btn = form.querySelector("button");
  btn.disabled = true;

  try {
    await api("/api/notices", {
      method: "POST",
      body: JSON.stringify({ title: input.value.trim() })
    });
    input.value = "";
    loadNotices();
  } catch (err) {
    alert(err.message);
  } finally {
    btn.disabled = false;
  }
};

window.deleteNotice = async (id) => {
  if (!confirm("Are you sure?")) return;
  try {
    await api(`/api/notices?id=${id}`, { method: "DELETE" });
    loadNotices();
  } catch (err) {
    alert(err.message);
  }
};

init();
