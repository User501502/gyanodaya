import { protectPage, getToken } from "./admin.js";
protectPage();

async function loadStats() {
  const token = await getToken();
  const headers = { Authorization: `Bearer ${token}` };

  const [notices, sections, admissions] = await Promise.all([
    fetch("/api/notices", { headers }).then(r => r.json()),
    fetch("/api/sections", { headers }).then(r => r.json()),
    fetch("/api/admissions", { headers }).then(r => r.json())
  ]);

  noticeCount.textContent = notices.length;
  sectionCount.textContent = sections.length;
  admissionCount.textContent = admissions.length;
}
loadStats();
