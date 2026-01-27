import connectDB from "./_db.js";
import mongoose from "mongoose";

const GallerySchema = new mongoose.Schema({
    url: String,
    title: String,
    type: { type: String, default: "photo" }, // "photo" | "video"
    createdAt: { type: Date, default: Date.now }
});

const Gallery = mongoose.models.Gallery || mongoose.model("Gallery", GallerySchema);

export default async function handler(req, res) {
    await connectDB();

    if (req.method === "GET") {
        const images = await Gallery.find().sort({ createdAt: -1 });
        return res.json(images);
    }

    if (req.method === "POST") {
        const item = new Gallery(req.body);
        await item.save();
        return res.json(item);
    }

    if (req.method === "DELETE") {
        const { id } = req.query;
        await Gallery.findByIdAndDelete(id);
        return res.json({ success: true });
    }

    res.status(405).json({ error: "Method not allowed" });
}
