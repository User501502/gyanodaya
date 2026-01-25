import connectDB from "../_db.js";
import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema({
  title: String,
  type: String,
  content: [String],
  isActive: Boolean,
  position: Number
});

const Section =
  mongoose.models.Section || mongoose.model("Section", SectionSchema);

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const updates = req.body;
  if (!Array.isArray(updates)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  // bulk update positions
  const bulkOps = updates.map(item => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: { position: item.position } }
    }
  }));

  await Section.bulkWrite(bulkOps);

  res.json({ success: true });
}
