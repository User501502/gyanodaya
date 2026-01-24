import connectDB from "./_db.js";
import mongoose from "mongoose";

const FooterSchema = new mongoose.Schema({
  about: String,
  address: String,
  phone: String,
  email: String,
  copyright: String,
  mapLink: String,
  mapEmbed: String
});

const HomeSchema = new mongoose.Schema({
  schoolName: String,
  logo: String,

  heroTitle: String,
  heroIntro: String,
  admissionOpen: Boolean,

  footer: FooterSchema   // 🔥 THIS WAS MISSING
});

const Home =
  mongoose.models.Home || mongoose.model("Home", HomeSchema);

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const data = await Home.findOne();
    return res.json(data);
  }

  if (req.method === "POST") {
    await Home.deleteMany(); // single home document
    const home = new Home(req.body);
    await home.save();
    return res.json(home);
  }

  res.status(405).json({ error: "Method not allowed" });
}
