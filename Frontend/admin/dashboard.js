import { api } from "./admin.js";

async function load() {
  const [sections, notices, admissions, tcs, disclosures] = await Promise.all([
    api("/api/sections"),
    api("/api/notices"),
    api("/api/admissions"),
    api("/api/tc"),
    api("/api/disclosure")
  ]);

  document.getElementById("sectionCount").textContent = sections.length;
  document.getElementById("noticeCount").textContent = notices.length;
  document.getElementById("admissionCount").textContent = admissions.length;
  document.getElementById("tcCount").textContent = tcs.length;
  document.getElementById("disclosureCount").textContent = disclosures.length;
}

load();
