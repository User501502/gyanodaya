import connectDB from "./_db.js";
import mongoose from "mongoose";

const HomeSchema = new mongoose.Schema({
  intro: String,
  admissionOpen: Boolean
});

const Home = mongoose.models.Home || mongoose.model("Home", HomeSchema);

export default async function handler(req, res) {
  await connectDB();

  // GET → website + admin
  if (req.method === "GET") {
    const data = await Home.findOne();
    return res.json(data);
  }

  // POST → overwrite home content (admin CMS)
  if (req.method === "POST") {
    await Home.deleteMany(); // only ONE home doc
    const home = new Home(req.body);
    await home.save();
    return res.json(home);
  }

  res.status(405).json({ error: "Method not allowed" });
}
