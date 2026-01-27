import connectDB from "./_db.js";
import mongoose from "mongoose";

const TCSchema = new mongoose.Schema({
    serialNo: String,
    studentName: String,
    className: String,
    year: String,
    tcNo: String,
    createdAt: { type: Date, default: Date.now }
});

const TC = mongoose.models.TC || mongoose.model("TC", TCSchema);

export default async function handler(req, res) {
    await connectDB();

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
        const { id } = req.query;
        await TC.findByIdAndDelete(id);
        return res.json({ success: true });
    }

    res.status(405).json({ error: "Method not allowed" });
}
