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

/* ANIMATED COUNTERS */
const counters = document.querySelectorAll('.counter');

counters.forEach(counter => {
  const updateCount = () => {
    const target = +counter.getAttribute('data-target');
    const current = +counter.innerText;
    const increment = Math.ceil(target / 100);

    if (current < target) {
      counter.innerText = current + increment;
      setTimeout(updateCount, 30);
    } else {
      counter.innerText = target + (target === 95 ? '%' : '+');
    }
  };

  updateCount();
});
