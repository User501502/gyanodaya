import connectDB from "./_db.js";
import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
    rollNo: String,
    name: { type: String, required: true },
    className: String, // e.g. "Class 10-A"
    fatherName: String,
    motherName: String,
    mobile: String,
    address: String,

    // Additional Identifiers
    penNumber: String,
    sssmId: String,
    aadharNumber: String,
    scholarNumber: String,

    // Admission Details
    admissionYear: String, // e.g. "2024-25"
    admissionDate: { type: Date, default: Date.now },

    // Third Contact
    contactPerson: {
        title: String, // e.g. Guardian, Uncle
        name: String,
        number: String
    },

    // Fees management
    totalFees: { type: Number, default: 0 },
    paidFees: { type: Number, default: 0 },
    feesStatus: { type: String, default: "pending" }, // "paid", "pending", "overdue"

    createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);

export default async function handler(req, res) {
    await connectDB();
    const { id, className, dueOnly } = req.query;

    if (req.method === "GET") {
        let query = {};
        if (className) query.className = className;
        if (dueOnly === "true") {
            // Find students where totalFees > paidFees
            query = { ...query, $expr: { $gt: ["$totalFees", "$paidFees"] } };
        }

        if (id) {
            const student = await Student.findById(id);
            return res.json(student);
        }

        const { recent } = req.query;
        let sort = { className: 1, name: 1 };

        if (recent === "true") {
            sort = { admissionDate: -1, createdAt: -1 };
        }

        const students = await Student.find(query).sort(sort);
        return res.json(students);
    }

    if (req.method === "POST") {
        const student = new Student(req.body);
        await student.save();
        return res.json(student);
    }

    if (req.method === "PUT") {
        const updated = await Student.findByIdAndUpdate(id, req.body, { new: true });
        return res.json(updated);
    }

    if (req.method === "DELETE") {
        await Student.findByIdAndDelete(id);
        return res.json({ success: true });
    }

    res.status(405).json({ error: "Method not allowed" });
}
