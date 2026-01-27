import { protectPage, initSidebar, api } from "./admin.js";

const form = document.getElementById("galleryForm");
const typeSelect = document.getElementById("type");
const fileGroup = document.getElementById("fileGroup");
const urlGroup = document.getElementById("urlGroup");
const galleryList = document.getElementById("galleryList");

async function init() {
    await protectPage();
    initSidebar();
    await loadGallery();
}

typeSelect.onchange = () => {
    if (typeSelect.value === "photo") {
        fileGroup.classList.remove("hidden");
        urlGroup.classList.add("hidden");
    } else {
        fileGroup.classList.add("hidden");
        urlGroup.classList.remove("hidden");
    }
};

async function loadGallery() {
    try {
        const data = await api("/api/gallery");
        galleryList.innerHTML = "";

        data.forEach(item => {
            const div = document.createElement("div");
            div.className = "card";
            div.style.padding = "10px";
            div.style.position = "relative";

            if (item.type === "photo") {
                div.innerHTML = `
                    <img src="${item.url}" style="width:100%; height:150px; object-fit:cover; border-radius:8px;">
                    <div style="font-size:12px; margin-top:8px;">${item.title}</div>
                `;
            } else {
                div.innerHTML = `
                    <div style="width:100%; height:150px; background:#000; display:flex; align-items:center; justify-content:center; border-radius:8px; color:#fff;">
                        <i class="fab fa-youtube fa-3x"></i>
                    </div>
                    <div style="font-size:12px; margin-top:8px;">${item.title} (Video)</div>
                `;
            }

            const delBtn = document.createElement("button");
            delBtn.className = "btn btn-danger btn-sm";
            delBtn.style.position = "absolute";
            delBtn.style.top = "5px";
            delBtn.style.right = "5px";
            delBtn.innerHTML = '<i class="fas fa-trash"></i>';
            delBtn.onclick = () => deleteItem(item._id);

            div.appendChild(delBtn);
            galleryList.appendChild(div);
        });
    } catch (err) {
        console.error(err);
    }
}

form.onsubmit = async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button");
    btn.disabled = true;

    let url = "";
    if (typeSelect.value === "photo") {
        const file = document.getElementById("fileInput").files[0];
        if (!file) return alert("Select a file");
        url = await toBase64(file);
    } else {
        url = document.getElementById("urlInput").value;
        if (!url) return alert("Enter URL");
    }

    try {
        await api("/api/gallery", {
            method: "POST",
            body: JSON.stringify({
                type: typeSelect.value,
                title: document.getElementById("title").value,
                url: url
            })
        });
        form.reset();
        typeSelect.onchange();
        loadGallery();
    } catch (err) {
        alert(err.message);
    } finally {
        btn.disabled = false;
    }
};

function toBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

async function deleteItem(id) {
    if (!confirm("Delete this item?")) return;
    try {
        await api(`/api/gallery?id=${id}`, { method: "DELETE" });
        loadGallery();
    } catch (err) {
        alert(err.message);
    }
}

init();
