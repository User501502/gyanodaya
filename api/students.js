import connectDB from "./_db.js";
import mongoose from "mongoose";

/* ================= SCHEMA ================= */

const PromotionSchema = new mongoose.Schema({
  fromClass: String,
  toClass: String,
  academicYear: String,
  action: String, // promote | tc | passout
  date: { type: Date, default: Date.now }
});

const StudentSchema = new mongoose.Schema({
  rollNo: String,
  name: { type: String, required: true },
  className: String,

  // FAMILY
  fatherName: String,
  fatherMobile: String,
  motherName: String,
  motherMobile: String,
  guardianName: String,
  guardianMobile: String,

  // IDS (DUPLICATE SAFE)
  aadharNumber: { type: String, index: true, sparse: true },
  fatherAadhar: String,
  motherAadhar: String,
  parentPan: String,
  penNumber: { type: String, index: true, sparse: true },

  // BANK
  bankDetails: {
    studentAccount: String,
    parentAccount: String,
    ifsc: String,
    bankName: String
  },

  // ADMISSION
  admissionYear: String,
  admissionDate: { type: Date, default: Date.now },

  // FEES
  totalFees: { type: Number, default: 0 },
  paidFees: { type: Number, default: 0 },

  // STATUS
  status: { type: String, default: "active" },

  // HISTORY
  history: [PromotionSchema],

  createdAt: { type: Date, default: Date.now }
});

const Student =
  mongoose.models.Student || mongoose.model("Student", StudentSchema);

/* ================= HANDLER ================= */

export default async function handler(req, res) {
  await connectDB();
  const { id, action } = req.query;

  /* ---------- GET ---------- */
  if (req.method === "GET") {
    if (id) {
      const student = await Student.findById(id);
      return res.json(student);
    }

    const { className, status } = req.query;
    const query = {};

    if (className) query.className = className;
    if (status && status !== "all") query.status = status;

    const students = await Student.find(query).sort({
      className: 1,
      name: 1
    });

    return res.json(students);
  }

  /* ---------- CREATE ---------- */
  if (req.method === "POST" && !action) {
    const { aadharNumber, penNumber } = req.body;

    if (aadharNumber) {
      const dup = await Student.findOne({ aadharNumber });
      if (dup)
        return res.status(400).json({ error: "Student Aadhar already exists" });
    }

    if (penNumber) {
      const dup = await Student.findOne({ penNumber });
      if (dup)
        return res.status(400).json({ error: "PEN already exists" });
    }

    const student = new Student(req.body);
    await student.save();
    return res.json(student);
  }

  /* ---------- UPDATE (MANUAL PROMOTE / TC / PASSOUT) ---------- */
  if (req.method === "PUT" && id) {
    const existing = await Student.findById(id);

    // Merge – empty field overwrite nahi karega
    const payload = {};
    Object.keys(req.body).forEach(k => {
      if (req.body[k] !== "" && req.body[k] !== null) {
        payload[k] = req.body[k];
      }
    });

    const updated = await Student.findByIdAndUpdate(
      id,
      { $set: payload },
      { new: true }
    );

    return res.json(updated);
  }

  /* ---------- BULK ACTIONS ---------- */
  if (req.method === "POST" && action === "bulk") {
    const { studentIds, type, targetClass, academicYear } = req.body;

    if (!studentIds || !studentIds.length)
      return res.status(400).json({ error: "No students selected" });

    const bulkOps = studentIds.map(id => {
      let update = {};
      let history = {};

      if (type === "promote") {
        update = { className: targetClass, status: "active" };
        history = {
          fromClass: "",
          toClass: targetClass,
          academicYear,
          action: "promote"
        };
      }

      if (type === "tc") {
        update = { status: "tc_issued" };
        history = { action: "tc", academicYear };
      }

      if (type === "passout") {
        update = { status: "passout" };
        history = { action: "passout", academicYear };
      }

      return {
        updateOne: {
          filter: { _id: id },
          update: {
            $set: update,
            $push: { history }
          }
        }
      };
    });

    await Student.bulkWrite(bulkOps);
    return res.json({ success: true, count: studentIds.length });
  }

  /* ---------- DELETE ---------- */
  if (req.method === "DELETE" && id) {
    await Student.findByIdAndDelete(id);
    return res.json({ success: true });
  }

  res.status(405).json({ error: "Method not allowed" });
}
