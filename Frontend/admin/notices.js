import { api } from "./admin.js";

const form = document.getElementById("noticeForm");
const list = document.getElementById("noticeList");

async function load() {
  const notices = await api("/api/notices");
  list.innerHTML = "";

  notices.forEach(n => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${n.title}
      <button onclick="del('${n._id}')">X</button>
    `;
    list.appendChild(li);
  });
}

form.onsubmit = async e => {
  e.preventDefault();

  await api("/api/notices", {
    method: "POST",
    body: JSON.stringify({ title: noticeText.value })
  });

  noticeText.value = "";
  load();
};

window.del = async id => {
  await api(`/api/notices?id=${id}`, { method: "DELETE" });
  load();
};

load();
