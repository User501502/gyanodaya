import { protectPage, api } from "./admin.js";
import { toast } from "./toast.js";

protectPage();

async function load() {
  const notices = await api("/api/notices");
  noticeList.innerHTML = "";
  notices.forEach(n => {
    const li = document.createElement("li");
    li.innerHTML = `${n.text}
      <button onclick="del('${n._id}')">X</button>`;
    noticeList.appendChild(li);
  });
}

noticeForm.onsubmit = async e => {
  e.preventDefault();
  await api("/api/notices", {
    method: "POST",
    body: JSON.stringify({ text: noticeText.value })
  });
  toast("Notice added");
  noticeText.value = "";
  load();
};

window.del = async id => {
  await api(`/api/notices?id=${id}`, { method: "DELETE" });
  toast("Deleted");
  load();
};

load();
