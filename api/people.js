import connectDB from "./_db.js";
import mongoose from "mongoose";

// Principal Schema (Single Document)
const PrincipalSchema = new mongoose.Schema({
    name: String,
    photo: String,
    message: String,
    designation: { type: String, default: "Principal" },
    updatedAt: { type: Date, default: Date.now }
});

const Principal = mongoose.models.Principal || mongoose.model("Principal", PrincipalSchema);

// Faculty Schema
const FacultySchema = new mongoose.Schema({
    name: String,
    designation: String,
    qualification: String,
    experience: String,
    photo: String,
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Faculty = mongoose.models.Faculty || mongoose.model("Faculty", FacultySchema);

// Management Schema
const ManagementSchema = new mongoose.Schema({
    name: { type: String, required: true },
    designation: String,
    message: String,
    photo: String,
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const Management = mongoose.models.Management || mongoose.model("Management", ManagementSchema);

export default async function handler(req, res) {
    await connectDB();
    const { type, id } = req.query;

    // Handle Principal (Type: principal)
    if (type === "principal") {
        if (req.method === "GET") {
            const data = await Principal.findOne();
            return res.json(data || {});
        }
        if (req.method === "POST") {
            await Principal.deleteMany();
            const principal = new Principal(req.body);
            await principal.save();
            return res.json(principal);
        }
    }

    // Handle Faculty (Type: faculty)
    if (type === "faculty") {
        if (req.method === "GET") {
            const faculty = await Faculty.find().sort({ order: 1, createdAt: 1 });
            return res.json(faculty);
        }
        if (req.method === "POST") {
            const member = new Faculty(req.body);
            await member.save();
            return res.json(member);
        }
        if (req.method === "PUT") {
            const updated = await Faculty.findByIdAndUpdate(id, req.body, { new: true });
            return res.json(updated);
        }
        if (req.method === "DELETE") {
            await Faculty.findByIdAndDelete(id);
            return res.json({ success: true });
        }
    }

    // Handle Management (Type: management)
    if (type === "management") {
        if (req.method === "GET") {
            const members = await Management.find().sort({ order: 1, createdAt: 1 });
            return res.json(members);
        }
        if (req.method === "POST") {
            const member = new Management(req.body);
            await member.save();
            return res.json(member);
        }
        if (req.method === "PUT") {
            const updated = await Management.findByIdAndUpdate(id, req.body, { new: true });
            return res.json(updated);
        }
        if (req.method === "DELETE") {
            await Management.findByIdAndDelete(id);
            return res.json({ success: true });
        }
    }

    res.status(405).json({ error: "Method or Type not allowed" });
}
