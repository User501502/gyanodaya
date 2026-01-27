import connectDB from "./_db.js";
import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema({
  title: String,
  type: String,           // "list" | "text" | "infrastructure" | "calendar"
  content: [String],
  position: Number,
  isActive: { type: Boolean, default: true },
  page: { type: String, default: "home" } // "home", "calendar", "infrastructure", "management", etc.
});

const Section =
  mongoose.models.Section || mongoose.model("Section", SectionSchema);

export default async function handler(req, res) {
  await connectDB();

  // GET → website + admin (ALL sections)
  if (req.method === "GET") {
    const { page } = req.query;
    let query = {};
    if (page === "home") {
      query = { $or: [{ page: "home" }, { page: { $exists: false } }, { page: "" }, { page: null }] };
    } else if (page) {
      query = { page };
    }
    const sections = await Section.find(query).sort({ position: 1 });
    return res.json(sections);
  }

  // POST → add new section
  if (req.method === "POST") {
    const section = new Section({
      ...req.body,
      position: req.body.position ?? Date.now()
    });
    await section.save();
    return res.json(section);
  }

  // PUT → edit section (title/content/type/isActive/position)
  if (req.method === "PUT") {
    const { id } = req.query;
    const updated = await Section.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    return res.json(updated);
  }

  // DELETE → remove section
  if (req.method === "DELETE") {
    const { id } = req.query;
    await Section.findByIdAndDelete(id);
    return res.json({ success: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
