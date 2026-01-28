import connectDB from "./_db.js";
import mongoose from "mongoose";

const FooterSchema = new mongoose.Schema({
  about: String,
  address: String,
  phone: String,
  email: String,
  mapLink: String,
  mapEmbed: String,
  quickLinks: [{ title: String, url: String }],
  socials: [{ name: String, url: String, icon: String }],
  copyright: String
});

const HomeSchema = new mongoose.Schema({
  schoolName: String,
  logo: String,
  heroTitle: String,
  heroIntro: String,
  heroImage: String,
  admissionOpen: Boolean,
  admissionYear: { type: String, default: "2024-25" },

  // Profile Details
  affiliationNo: String,
  schoolCode: String,
  diseCode: String,
  foundedYear: String,

  // Homepage Stats
  stats: {
    students: Number,
    teachers: Number,
    facilities: Number,
    successRate: Number
  },

  footer: FooterSchema
});

const Home = mongoose.models.Home || mongoose.model("Home", HomeSchema);

export default async function handler(req, res) {
  await connectDB();
  const { backup } = req.query;

  // Backup functionality
  if (backup === "true") {
    try {
      const collections = ["Home", "Section", "Notice", "Faculty", "Student", "TC", "Disclosure", "Gallery", "Admission", "Asset", "Record", "Management", "Principal"];
      const backupData = {};
      for (const modelName of collections) {
        const Model = mongoose.models[modelName];
        if (Model) backupData[modelName] = await Model.find({});
      }
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=gyanodaya_backup.json');
      return res.json(backupData);
    } catch (err) {
      return res.status(500).json({ error: "Backup failed: " + err.message });
    }
  }

  if (req.method === "GET") {
    const data = await Home.findOne();
    return res.json(data || {});
  }

  if (req.method === "POST") {
    await Home.deleteMany();
    const home = new Home(req.body);
    await home.save();
    return res.json(home);
  }

  res.status(405).json({ error: "Method not allowed" });
}
