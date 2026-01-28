import connectDB from "./_db.js";
import mongoose from "mongoose";

const GallerySchema = new mongoose.Schema({
    url: String,
    title: String,
    type: { type: String, default: "photo" }, // "photo" | "video"
    createdAt: { type: Date, default: Date.now }
});

const Gallery = mongoose.models.Gallery || mongoose.model("Gallery", GallerySchema);

function getEmbedUrl(url) {
    if (!url) return url;
    if (url.includes("youtube.com/embed/")) return url;

    let videoId = "";
    if (url.includes("v=")) {
        videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
        videoId = url.split("be/")[1].split("?")[0];
    } else if (url.includes("shorts/")) {
        videoId = url.split("shorts/")[1].split("?")[0];
    } else if (url.includes("youtube.com/embed/")) {
        videoId = url.split("embed/")[1].split("?")[0];
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
}

export default async function handler(req, res) {
    await connectDB();

    if (req.method === "GET") {
        const items = await Gallery.find().sort({ createdAt: -1 });
        const processedItems = items.map(item => {
            const doc = item.toObject();
            if (doc.type === "video") {
                doc.url = getEmbedUrl(doc.url);
            }
            return doc;
        });
        return res.json(processedItems);
    }

    if (req.method === "POST") {
        const data = req.body;
        if (data.type === "video") {
            data.url = getEmbedUrl(data.url);
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
