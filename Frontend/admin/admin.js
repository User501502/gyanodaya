const API = "/api"; // IMPORTANT (same domain)

async function saveHome() {
  const body = {
    intro: intro.value,
    whyChooseUs: why.value.split("\n"),
    facilities: facilities.value.split("\n"),
    admissionOpen: admissionOpen.checked
  };

  await fetch(`${API}/home`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  alert("Home page updated");
}
