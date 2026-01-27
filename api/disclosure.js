import connectDB from "./_db.js";
import mongoose from "mongoose";

const DisclosureSchema = new mongoose.Schema({
    title: String,
    fileUrl: String,
    createdAt: { type: Date, default: Date.now }
});

const Disclosure = mongoose.models.Disclosure || mongoose.model("Disclosure", DisclosureSchema);

export default async function handler(req, res) {
    await connectDB();

    if (req.method === "GET") {
        const disclosures = await Disclosure.find().sort({ createdAt: -1 });
        return res.json(disclosures);
    }

    if (req.method === "POST") {
        const disclosure = new Disclosure(req.body);
        await disclosure.save();
        return res.json(disclosure);
    }

    if (req.method === "DELETE") {
        const { id } = req.query;
        await Disclosure.findByIdAndDelete(id);
        return res.json({ success: true });
    }

    res.status(405).json({ error: "Method not allowed" });
}
