import { protectPage, api } from "./admin.js";
import { toast } from "./toast.js";

protectPage();

async function loadHome() {
  const data = await api("/api/home");
  introText.value = data.introText;
  admissionOpen.checked = data.admissionOpen;
}

homeForm.onsubmit = async e => {
  e.preventDefault();
  await api("/api/home", {
    method: "PUT",
    body: JSON.stringify({
      introText: introText.value,
      admissionOpen: admissionOpen.checked
    })
  });
  toast("Home updated");
};

loadHome();
