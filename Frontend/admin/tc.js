import { api } from "./admin.js";

const form = document.getElementById("tcForm");
const tableBody = document.getElementById("tcTableBody");

async function load() {
    const tcs = await api("/api/tc");
    tableBody.innerHTML = "";

    tcs.forEach(n => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
      <td style="padding: 10px; border: 1px solid #ddd;">${n.studentName}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${n.className}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${n.year}</td>
      <td style="padding: 10px; border: 1px solid #ddd;">${n.tcNo}</td>
      <td style="padding: 10px; border: 1px solid #ddd; text-align: center;">
        <button onclick="del('${n._id}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Delete</button>
      </td>
    `;
        tableBody.appendChild(tr);
    });
}

form.onsubmit = async e => {
    e.preventDefault();
    const data = {
        studentName: document.getElementById("studentName").value,
        className: document.getElementById("className").value,
        year: document.getElementById("year").value,
        tcNo: document.getElementById("tcNo").value
    };

    await api("/api/tc", {
        method: "POST",
        body: JSON.stringify(data)
    });

    form.reset();
    load();
};

window.del = async id => {
    if (confirm("Are you sure you want to delete this TC record?")) {
        await api(`/api/tc?id=${id}`, { method: "DELETE" });
        load();
    }
};

load();
