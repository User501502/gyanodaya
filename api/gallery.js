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
        const data = req.body;

        // Auto convert YouTube URL to embed URL if it's a video
        if (data.type === "video" && data.url) {
            let videoId = "";
            if (data.url.includes("v=")) {
                videoId = data.url.split("v=")[1].split("&")[0];
            } else if (data.url.includes("be/")) {
                videoId = data.url.split("be/")[1].split("?")[0];
            } else if (data.url.includes("embed/")) {
                videoId = data.url.split("embed/")[1].split("?")[0];
            }

            if (videoId) {
                data.url = `https://www.youtube.com/embed/${videoId}`;
            }
        }

        const item = new Gallery(data);
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
