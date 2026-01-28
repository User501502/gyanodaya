import connectDB from "./_db.js";
import mongoose from "mongoose";

const PrincipalSchema = new mongoose.Schema({
    name: String,
    photo: String,
    message: String,
    designation: { type: String, default: "Principal" },
    updatedAt: { type: Date, default: Date.now }
});

const Principal = mongoose.models.Principal || mongoose.model("Principal", PrincipalSchema);

export default async function handler(req, res) {
    await connectDB();

    if (req.method === "GET") {
        try {
            const data = await Principal.findOne();
            return res.json(data || {});
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    if (req.method === "POST") {
        try {
            await Principal.deleteMany(); // Keep only one document
            const data = new Principal(req.body);
            await data.save();
            return res.json(data);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    res.status(405).json({ error: "Method not allowed" });
}
