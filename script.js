/* ===============================
   BASIC INTERACTIONS & VALIDATION
   =============================== */

function validateForm() {
  const name = document.getElementById("name").value.trim();
  const mobile = document.getElementById("mobile").value.trim();

  if (name === "" || mobile === "") {
    alert("Please fill required fields");
    return false;
  }

  if (mobile.length !== 10) {
    alert("Enter valid 10-digit mobile number");
    return false;
  }

  alert("Form submitted successfully (demo)");
  return true;
}

/* GALLERY MODAL */
function openModal(img) {
  document.getElementById("modal").style.display = "block";
  document.getElementById("modalImg").src = img.src;
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}
