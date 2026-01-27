import { protectPage, initSidebar, api } from "./admin.js";

const grid = document.getElementById("facultyGrid");
const modal = document.getElementById("facultyModal");
const form = document.getElementById("facultyForm");
const photoInput = document.getElementById("facPhotoInput");
const photoPreview = document.getElementById("facPreview");

let currentPhotoBase64 = "";

async function init() {
    await protectPage();
    initSidebar();
    loadFaculty();
}

async function loadFaculty() {
    try {
        const data = await api("/api/faculty");
        grid.innerHTML = "";
        data.forEach(item => {
            const div = document.createElement("div");
            div.className = "card";
            div.style.textAlign = "center";
            div.style.padding = "20px";
            div.innerHTML = `
                <img src="${item.photo || 'https://via.placeholder.com/150'}" style="width:100px; height:100px; border-radius:50%; object-fit:cover; margin-bottom:15px;">
                <h3 style="font-size:18px;">${item.name}</h3>
                <p style="color:var(--primary); font-weight:600; font-size:14px; margin-bottom:5px;">${item.designation}</p>
                <p style="font-size:12px; color:var(--text-muted);">${item.qualification || ""}</p>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button class="btn btn-secondary btn-sm" onclick="editMember('${item._id}')" style="flex:1;"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteMember('${item._id}')" style="flex:1;"><i class="fas fa-trash"></i></button>
                </div>
            `;
            grid.appendChild(div);
        });
    } catch (err) {
        console.error(err);
    }
}

window.showAddModal = () => {
    form.reset();
    document.getElementById("editId").value = "";
    document.getElementById("modalTitle").innerText = "Add Faculty Member";
    photoPreview.style.display = "none";
    currentPhotoBase64 = "";
    modal.style.display = "flex";
}

window.closeModal = () => {
    modal.style.display = "none";
}

photoInput.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        currentPhotoBase64 = reader.result;
        photoPreview.src = currentPhotoBase64;
        photoPreview.style.display = "block";
    };
    reader.readAsDataURL(file);
}

form.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById("editId").value;
    const payload = {
        name: document.getElementById("facName").value,
        designation: document.getElementById("facDesignation").value,
        qualification: document.getElementById("facQualification").value,
        experience: document.getElementById("facExperience").value,
        order: parseInt(document.getElementById("facOrder").value) || 0,
        photo: currentPhotoBase64
    };

    try {
        if (id) {
            await api("/api/faculty", {
                method: "PUT",
                body: JSON.stringify({ id, ...payload })
            });
        } else {
            await api("/api/faculty", {
                method: "POST",
                body: JSON.stringify(payload)
            });
        }
        closeModal();
        loadFaculty();
    } catch (err) {
        alert(err.message);
    }
}

window.editMember = async (id) => {
    try {
        const data = await api("/api/faculty");
        const member = data.find(m => m._id === id);
        if (!member) return;

        document.getElementById("editId").value = member._id;
        document.getElementById("facName").value = member.name;
        document.getElementById("facDesignation").value = member.designation;
        document.getElementById("facQualification").value = member.qualification || "";
        document.getElementById("facExperience").value = member.experience || "";
        document.getElementById("facOrder").value = member.order || 0;

        currentPhotoBase64 = member.photo || "";
        if (currentPhotoBase64) {
            photoPreview.src = currentPhotoBase64;
            photoPreview.style.display = "block";
        } else {
            photoPreview.style.display = "none";
        }

        document.getElementById("modalTitle").innerText = "Edit Faculty Member";
        modal.style.display = "flex";
    } catch (err) { alert(err.message); }
}

window.deleteMember = async (id) => {
    if (!confirm("Delete this member?")) return;
    try {
        await api(`/api/faculty?id=${id}`, { method: "DELETE" });
        loadFaculty();
    } catch (err) { alert(err.message); }
}

init();
