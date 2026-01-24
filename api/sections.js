import connectDB from "./_db";
import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema({
  title: String,
  type: String,
  content: [String],
  position: Number,
  isActive: Boolean
});

const Section = mongoose.models.Section || mongoose.model("Section", SectionSchema);

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const sections = await Section.find({ isActive: true }).sort({ position: 1 });
    return res.json(sections);
  }

  if (req.method === "POST") {
    const section = new Section(req.body);
    await section.save();
    return res.json(section);
  }
}
