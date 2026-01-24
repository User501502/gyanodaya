import { protectPage, api } from "./admin.js";
protectPage();

async function load() {
  const data = await api("/api/admissions");
  admissionTable.innerHTML = "";

  data.forEach(a => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${a.name}</td>
      <td>${a.phone}</td>
      <td>${new Date(a.createdAt).toLocaleDateString()}</td>
      <td>
        <input type="checkbox" ${a.contacted?"checked":""}
          onchange="mark('${a._id}',this.checked)">
      </td>`;
    admissionTable.appendChild(tr);
  });
}

window.mark = async (id,val) => {
  await api(`/api/admissions?id=${id}`, {
    method: "PATCH",
    body: JSON.stringify({ contacted: val })
  });
};

load();
