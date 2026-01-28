import connectDB from "./_db.js";
import mongoose from "mongoose";

// TC Schema
const TCSchema = new mongoose.Schema({
    serialNo: String,
    studentName: String,
    className: String,
    year: String,
    tcNo: String,
    fileUrl: String,
    createdAt: { type: Date, default: Date.now }
});

const TC = mongoose.models.TC || mongoose.model("TC", TCSchema);

// Disclosure Schema
const DisclosureSchema = new mongoose.Schema({
    title: String,
    fileUrl: String,
    createdAt: { type: Date, default: Date.now }
});

const Disclosure = mongoose.models.Disclosure || mongoose.model("Disclosure", DisclosureSchema);

export default async function handler(req, res) {
    await connectDB();
    const { type, id } = req.query;

    // Handle TC (Type: tc)
    if (type === "tc") {
        if (req.method === "GET") {
            const tcs = await TC.find().sort({ createdAt: -1 });
            return res.json(tcs);
        }
        if (req.method === "POST") {
            const tc = new TC(req.body);
            await tc.save();
            return res.json(tc);
        }
        if (req.method === "DELETE") {
            await TC.findByIdAndDelete(id);
            return res.json({ success: true });
        }
    }

    // Handle Disclosure (Type: disclosure)
    if (type === "disclosure") {
        if (req.method === "GET") {
            const disclosures = await Disclosure.find().sort({ createdAt: -1 });
            return res.json(disclosures);
        }
        if (req.method === "POST") {
            const disc = new Disclosure(req.body);
            await disc.save();
            return res.json(disc);
        }
        if (req.method === "DELETE") {
            await Disclosure.findByIdAndDelete(id);
            return res.json({ success: true });
        }
    }

    res.status(405).json({ error: "Method or Type not allowed" });
}
