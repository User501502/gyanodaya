import connectDB from "./_db.js";
import mongoose from "mongoose";

const AssetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, default: "file" }, // image, pdf, etc.
    size: Number,
    createdAt: { type: Date, default: Date.now }
});

const Asset = mongoose.models.Asset || mongoose.model("Asset", AssetSchema);

export default async function handler(req, res) {
    await connectDB();

    if (req.method === "GET") {
        try {
            const assets = await Asset.find().sort({ createdAt: -1 });
            return res.json(assets);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    if (req.method === "POST") {
        try {
            const asset = new Asset(req.body);
            await asset.save();
            return res.status(201).json(asset);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    if (req.method === "DELETE") {
        try {
            const { id } = req.query;
            await Asset.findByIdAndDelete(id);
            return res.json({ message: "Asset deleted" });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    res.status(405).json({ error: "Method not allowed" });
}
