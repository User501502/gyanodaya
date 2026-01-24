import connectDB from "./_db.js";
import mongoose from "mongoose";

const SectionSchema = new mongoose.Schema({
  type: String,          // hero, notice, section, map, footer
  title: String,
  content: String,
  enabled: Boolean,
  order: Number
});

const HomeSchema = new mongoose.Schema({
  schoolName: String,
  admissionOpen: Boolean,
  heroTitle: String,
  heroIntro: String,
  sections: [SectionSchema]
});

const Home = mongoose.models.Home || mongoose.model("Home", HomeSchema);

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const data = await Home.findOne();
    return res.json(data);
  }

  if (req.method === "POST") {
    await Home.deleteMany(); // SINGLE SOURCE OF TRUTH
    const home = new Home(req.body);
    await home.save();
    return res.json(home);
  }

  res.status(405).json({ error: "Method not allowed" });
}
