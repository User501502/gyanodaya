import { protectPage, initSidebar, api } from "./admin.js";

const form = document.getElementById("disclosureForm");
const container = document.getElementById("disclosureList");

async function init() {
    await protectPage();
    initSidebar();
    await loadDisclosures();
}

async function loadDisclosures() {
    try {
        const data = await api("/api/disclosure");
        container.innerHTML = "";

        if (data.length === 0) {
            container.innerHTML = "<p>No documents listed.</p>";
            return;
        }

        data.forEach(item => {
            const div = document.createElement("div");
            div.className = "card";
            div.style.padding = "15px";
            div.style.marginBottom = "10px";
            div.style.display = "flex";
            div.style.justifyContent = "space-between";
            div.style.alignItems = "center";
            div.style.borderLeft = "4px solid var(--success)";

            div.innerHTML = `
                <div>
                    <div style="font-weight:600;">${item.title}</div>
                    <div style="font-size:12px; color: var(--text-muted);">${item.fileUrl}</div>
                </div>
                <button class="btn btn-danger btn-sm" onclick="deleteItem('${item._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        console.error(err);
    }
}

form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button");
    btn.disabled = true;

    const payload = {
        title: document.getElementById("title").value,
        fileUrl: document.getElementById("fileUrl").value
    };

    try {
        await api("/api/disclosure", { method: "POST", body: JSON.stringify(payload) });
        form.reset();
        loadDisclosures();
    } catch (err) {
        alert(err.message);
    } finally {
        btn.disabled = false;
    }
};

window.deleteItem = async (id) => {
    if (!confirm("Remove this document?")) return;
    try {
        await api(`/api/disclosure?id=${id}`, { method: "DELETE" });
        loadDisclosures();
    } catch (err) {
        alert(err.message);
    }
};

init();
