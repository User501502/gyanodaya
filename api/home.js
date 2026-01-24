import connectDB from "./_db";
import mongoose from "mongoose";

const HomeSchema = new mongoose.Schema({
  intro: String,
  whyChooseUs: [String],
  facilities: [String],
  admissionOpen: Boolean
});

const Home = mongoose.models.Home || mongoose.model("Home", HomeSchema);

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const data = await Home.findOne();
    return res.json(data);
  }

  if (req.method === "POST") {
    await Home.deleteMany();
    const home = new Home(req.body);
    await home.save();
    return res.json(home);
  }
}
