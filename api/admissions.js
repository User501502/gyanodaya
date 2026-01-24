import connectDB from "./_db";
import mongoose from "mongoose";

const AdmissionSchema = new mongoose.Schema({
  name: String,
  phone: String,
  classApplied: String,
  contacted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Admission =
  mongoose.models.Admission || mongoose.model("Admission", AdmissionSchema);

export default async function handler(req, res) {
  await connectDB();

  // GET → admin panel
  if (req.method === "GET") {
    const data = await Admission.find().sort({ createdAt: -1 });
    return res.json(data);
  }

  // POST → public website form
  if (req.method === "POST") {
    const admission = new Admission(req.body);
    await admission.save();
    return res.json({ success: true });
  }

  // PATCH → mark contacted
  if (req.method === "PATCH") {
    const { id } = req.query;
    const updated = await Admission.findByIdAndUpdate(
      id,
      { contacted: req.body.contacted },
      { new: true }
    );
    return res.json(updated);
  }

  res.status(405).json({ error: "Method not allowed" });
}
