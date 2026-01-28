import { protectPage, initSidebar, api } from "./admin.js";

const admissionTable = document.getElementById("admissionTable");

async function init() {
  await protectPage();
  initSidebar();
  await loadAdmissions();
}

async function loadAdmissions() {
  try {
    const data = await api("/api/docs?type=enquiry");
    admissionTable.innerHTML = "";

    if (data.length === 0) {
      admissionTable.innerHTML = "<tr><td colspan='6' style='text-align:center'>No enquiries found.</td></tr>";
      return;
    }

    data.forEach(a => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td><strong>${a.name}</strong></td>
                <td>${a.phone}</td>
                <td>${a.classLevel || 'N/A'}</td>
                <td>${new Date(a.createdAt).toLocaleDateString()}</td>
                <td>
                    <label class="switch">
                        <input type="checkbox" ${a.contacted ? "checked" : ""} onchange="markContacted('${a._id}', this.checked)">
                        Contacted
                    </label>
                </td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteAdmission('${a._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
      admissionTable.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
  }
}

window.markContacted = async (id, val) => {
  try {
    await api(`/api/docs?type=enquiry&id=${id}`, {
      method: "PATCH",
      body: JSON.stringify({ contacted: val })
    });
  } catch (err) {
    alert(err.message);
  }
};

window.deleteAdmission = async (id) => {
  if (!confirm("Delete this enquiry?")) return;
  try {
    await api(`/api/docs?type=enquiry&id=${id}`, { method: "DELETE" });
    loadAdmissions();
  } catch (err) {
    alert(err.message);
  }
};

init();
