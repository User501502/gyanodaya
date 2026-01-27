import connectDB from "./_db.js";
import mongoose from "mongoose";

const RecordSchema = new mongoose.Schema({
    category: { type: String, required: true }, // "fees", "books", "calendar"
    col1: String, // e.g. Class name / Date
    col2: String, // e.g. Fee amount / Event Title
    col3: String, // e.g. Frequency / Description
    col4: String, // Optional 4th column
    position: { type: Number, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

const Record = mongoose.models.Record || mongoose.model("Record", RecordSchema);

export default async function handler(req, res) {
    await connectDB();

    if (req.method === "GET") {
        try {
            const { category } = req.query;
            const query = category ? { category } : {};
            const records = await Record.find(query).sort({ position: 1 });
            return res.json(records);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    if (req.method === "POST") {
        try {
            const record = new Record(req.body);
            await record.save();
            return res.status(201).json(record);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    if (req.method === "PUT") {
        try {
            const { id } = req.query;
            const record = await Record.findByIdAndUpdate(id, req.body, { new: true });
            return res.json(record);
        } catch (err) {
            return res.status(400).json({ error: err.message });
        }
    }

    if (req.method === "DELETE") {
        try {
            const { id } = req.query;
            await Record.findByIdAndDelete(id);
            return res.json({ message: "Record deleted" });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    res.status(405).json({ error: "Method not allowed" });
}
