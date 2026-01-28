import connectDB from "./_db.js";
import mongoose from "mongoose";

const ManagementSchema = new mongoose.Schema({
    name: { type: String, required: true },
    designation: String,
    message: String,
    photo: String, // Base64 or URL
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Management = mongoose.models.Management || mongoose.model("Management", ManagementSchema);

export default async function handler(req, res) {
    await connectDB();

    if (req.method === "GET") {
        try {
            const members = await Management.find().sort({ order: 1, createdAt: 1 });
            return res.json(members);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    if (req.method === "POST") {
        try {
            const member = new Management(req.body);
            await member.save();
            return res.status(201).json(member);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    if (req.method === "PUT") {
        try {
            const { id } = req.query;
            const updated = await Management.findByIdAndUpdate(id, req.body, { new: true });
            return res.json(updated);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    if (req.method === "DELETE") {
        try {
            const { id } = req.query;
            await Management.findByIdAndDelete(id);
            return res.json({ success: true });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    res.status(405).json({ error: "Method not allowed" });
}
