import connectDB from "./_db";
import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema({
  title: String,
  createdAt: { type: Date, default: Date.now }
});

const Notice = mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);

export default async function handler(req, res) {
  await connectDB();

  if (req.method === "GET") {
    const notices = await Notice.find().sort({ createdAt: -1 });
    return res.json(notices);
  }

  if (req.method === "POST") {
    const notice = new Notice(req.body);
    await notice.save();
    return res.json(notice);
  }

  if (req.method === "DELETE") {
    const { id } = req.query;
    await Notice.findByIdAndDelete(id);
    return res.json({ success: true });
  }
}
