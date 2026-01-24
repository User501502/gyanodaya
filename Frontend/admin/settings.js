import { protectPage, api } from "./admin.js";
import { toast } from "./toast.js";

protectPage();

async function load() {
  const s = await api("/api/settings");
  schoolName.value = s.schoolName;
  email.value = s.email;
  address.value = s.address;
  footer.value = s.footer;
}

settingsForm.onsubmit = async e => {
  e.preventDefault();
  await api("/api/settings", {
    method: "PUT",
    body: JSON.stringify({
      schoolName: schoolName.value,
      email: email.value,
      address: address.value,
      footer: footer.value
    })
  });
  toast("Settings saved");
};

load();
