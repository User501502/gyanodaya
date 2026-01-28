import { protectPage, initSidebar, api } from "./admin.js";

const form = document.getElementById("tcForm");
const tbodyLegacy = document.getElementById("tcTableBody");
const tbodyArchive = document.getElementById("archiveTableBody");

async function init() {
    await protectPage();
    initSidebar();

    // Default load archive
    loadArchive();
}

window.switchTab = (tab) => {
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.style.borderBottom = "3px solid transparent";
        b.style.color = "#64748b";
        b.classList.remove('active');
    });
    document.querySelectorAll('[id^="tab-"]').forEach(d => d.style.display = "none");

    const btn = document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`);
    if (btn) {
        btn.style.borderBottom = "3px solid var(--primary)";
        btn.style.color = "var(--primary)";
        btn.classList.add('active');
    }
    document.getElementById(`tab-${tab}`).style.display = "block";

    if (tab === 'legacy') loadTCs();
    if (tab === 'archive') loadArchive();
}

window.loadArchive = async () => {
    const filter = document.getElementById("archiveFilter").value;
    const search = document.getElementById("archiveSearch").value.toLowerCase();

    tbodyArchive.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Loading...</td></tr>';

    try {
        let url = "/api/students?status=all"; // Fetch all then filter, or fetch specific?
        // To cover 'all inactive', we might need to fetch all and filter out active.
        // Or if filter is specific, pass that.

        let data = [];
        if (filter === 'all') {
            const all = await api("/api/students?status=all");
            data = all.filter(s => s.status !== 'active');
        } else {
            console.log("Fetching status:", filter);
            data = await api(`/api/students?status=${filter}`);
        }

        if (search) {
            data = data.filter(s => s.name.toLowerCase().includes(search));
        }

        tbodyArchive.innerHTML = "";
        if (data.length === 0) {
            tbodyArchive.innerHTML = `<tr><td colspan="6" style="padding:20px; text-align:center;">No inactive students found</td></tr>`;
            return;
        }

        data.forEach(s => {
            const tr = document.createElement("tr");
            let badgeColor = "#64748b";
            if (s.status === 'passout') badgeColor = "#22c55e"; // green
            if (s.status === 'tc_issued') badgeColor = "#f59e0b"; // amber

            tr.innerHTML = `
                <td>
                    <div style="font-weight:700;">${s.name}</div>
                    <div style="font-size:11px; color:#64748b;">ID: ${s.rollNo || 'N/A'}</div>
                </td>
                <td>${s.className}</td>
                <td>
                    <span style="background:${badgeColor}20; color:${badgeColor}; padding:2px 8px; border-radius:10px; font-size:11px; font-weight:700; text-transform:uppercase;">
                        ${s.status?.replace('_', ' ') || 'Archived'}
                    </span>
                </td>
                <td>${s.fatherName || '-'}</td>
                <td>${s.mobile || s.fatherMobile || '-'}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="restoreStudent('${s._id}')" title="Restore to Active">
                        <i class="fas fa-undo"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteStudentPermanently('${s._id}')" title="Delete Permanently">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbodyArchive.appendChild(tr);
        });

    } catch (err) {
        console.error(err);
        tbodyArchive.innerHTML = `<tr><td colspan="6" style="color:red; text-align:center;">Error: ${err.message}</td></tr>`;
    }
}

window.restoreStudent = async (id) => {
    if (!confirm("Restore this student to Active status? They will appear in the main student list again.")) return;
    try {
        await api(`/api/students?id=${id}`, {
            method: "PUT",
            body: JSON.stringify({ status: "active" })
        });
        loadArchive();
    } catch (err) { alert(err.message); }
}

window.deleteStudentPermanently = async (id) => {
    if (!confirm("PERMANENTLY DELETE current student record? This cannot be undone.")) return;
    try {
        await api(`/api/students?id=${id}`, { method: "DELETE" });
        loadArchive();
    } catch (err) { alert(err.message); }
}

// Legacy Functions
async function loadTCs() {
    try {
        const data = await api("/api/docs?type=tc");
        tbodyLegacy.innerHTML = "";
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
            tbodyLegacy.appendChild(tr);
        });
    } catch (err) { console.error(err); }
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
        await api("/api/docs?type=tc", { method: "POST", body: JSON.stringify(payload) });
        form.reset();
        loadTCs();
    } catch (err) { alert(err.message); }
    finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
};

window.deleteTC = async (id) => {
    if (!confirm("Delete this legacy record?")) return;
    try {
        await api(`/api/docs?type=tc&id=${id}`, { method: "DELETE" });
        loadTCs();
    } catch (err) { alert(err.message); }
};

init();
