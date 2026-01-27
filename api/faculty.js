import connectDB from "./_db.js";
import mongoose from "mongoose";

const FacultySchema = new mongoose.Schema({
    name: String,
    designation: String,
    qualification: String,
    experience: String,
    photo: String, // Base64 or URL
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Faculty = mongoose.models.Faculty || mongoose.model("Faculty", FacultySchema);

export default async function handler(req, res) {
    await connectDB();

    if (req.method === "GET") {
        const faculty = await Faculty.find().sort({ order: 1, createdAt: 1 });
        return res.json(faculty);
    }

    if (req.method === "POST") {
        const member = new Faculty(req.body);
        await member.save();
        return res.json(member);
    }

    if (req.method === "PUT") {
        const { id, ...updateData } = req.body;
        const updated = await Faculty.findByIdAndUpdate(id, updateData, { new: true });
        return res.json(updated);
    }

    if (req.method === "DELETE") {
        const { id } = req.query;
        await Faculty.findByIdAndDelete(id);
        return res.json({ success: true });
    }

    res.status(405).json({ error: "Method not allowed" });
}
