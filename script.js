function validateForm() {
  const name = document.getElementById("name")?.value.trim();
  const mobile = document.getElementById("mobile")?.value.trim();

  if (!name || !mobile) {
    alert("Please fill all required fields");
    return false;
  }

  if (mobile.length !== 10) {
    alert("Enter valid 10-digit mobile number");
    return false;
  }

  alert("Form submitted successfully");
  return false;
}

/* GALLERY MODAL */
function openModal(img) {
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modalImg").src = img.src;
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function toggleMenu() {
  document.getElementById("navMenu").classList.toggle("active");
}
