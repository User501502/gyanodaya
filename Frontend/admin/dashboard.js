import { api } from "./admin.js";

async function load() {
  const [sections, notices] = await Promise.all([
    api("/api/sections"),
    api("/api/notices")
  ]);

  document.getElementById("sectionCount").textContent = sections.length;
  document.getElementById("noticeCount").textContent = notices.length;
}

load();
