import { protectPage, initSidebar, api } from "./admin.js";

const form = document.getElementById("tcForm");
const tbody = document.getElementById("tcTableBody");

async function init() {
    await protectPage();
    initSidebar();
    await loadTCs();
}

async function loadTCs() {
    try {
        const data = await api("/api/tc");
        tbody.innerHTML = "";

        data.forEach(tc => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${tc.studentName}</td>
                <td>${tc.className}</td>
                <td>${tc.year}</td>
                <td>${tc.tcNo}</td>
                <td>
                    ${tc.fileUrl ? `<a href="${tc.fileUrl}" target="_blank" class="btn btn-secondary btn-sm"><i class="fas fa-file-pdf"></i> View</a>` : '<span class="text-muted">No File</span>'}
                    <button class="btn btn-danger btn-sm" onclick="deleteTC('${tc._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error(err);
    }
}

form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button");
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

    const payload = {
        studentName: document.getElementById("studentName").value,
        className: document.getElementById("studentClass").value,
        year: document.getElementById("tcYear").value,
        tcNo: document.getElementById("tcNumber").value,
        fileUrl: document.getElementById("tcFileUrl").value
    };

    try {
        await api("/api/tc", { method: "POST", body: JSON.stringify(payload) });
        form.reset();
        loadTCs();
    } catch (err) {
        alert(err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
};

window.deleteTC = async (id) => {
    if (!confirm("Delete this record?")) return;
    try {
        await api(`/api/tc?id=${id}`, { method: "DELETE" });
        loadTCs();
    } catch (err) {
        alert(err.message);
    }
};

init();
