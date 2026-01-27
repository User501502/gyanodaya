import { api } from "./admin.js";

const form = document.getElementById("disclosureForm");
const list = document.getElementById("disclosureList");

async function load() {
    const items = await api("/api/disclosure");
    list.innerHTML = "";

    items.forEach(n => {
        const li = document.createElement("li");
        li.style = "display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; align-items: center;";
        li.innerHTML = `
      <span>
        <strong>${n.title}</strong><br>
        <small><a href="${n.fileUrl}" target="_blank">${n.fileUrl}</a></small>
      </span>
      <button onclick="del('${n._id}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Delete</button>
    `;
        list.appendChild(li);
    });
}

form.onsubmit = async e => {
    e.preventDefault();
    const data = {
        title: document.getElementById("title").value,
        fileUrl: document.getElementById("fileUrl").value
    };

    await api("/api/disclosure", {
        method: "POST",
        body: JSON.stringify(data)
    });

    form.reset();
    load();
};

window.del = async id => {
    if (confirm("Are you sure you want to delete this document?")) {
        await api(`/api/disclosure?id=${id}`, { method: "DELETE" });
        load();
    }
};

load();
