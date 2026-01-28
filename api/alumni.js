import connectDB from "./_db.js";
import mongoose from "mongoose";

/* ================= MODELS ================= */

// STUDENT (already exists in DB)
const Student =
  mongoose.models.Student ||
  mongoose.model(
    "Student",
    new mongoose.Schema({}, { strict: false })
  );

// MANUAL ALUMNI (legacy)
const AlumniSchema = new mongoose.Schema({
  name: String,
  lastClass: String,
  fatherName: String,
  mobile: String,
  academicYear: String,
  source: { type: String, default: "manual" },
  createdAt: { type: Date, default: Date.now }
});

const Alumni =
  mongoose.models.Alumni || mongoose.model("Alumni", AlumniSchema);

/* ================= HANDLER ================= */

export default async function handler(req, res) {
  await connectDB();

  /* ---------- GET : LIST ALUMNI ---------- */
  if (req.method === "GET") {
    const { year, q } = req.query;

    /* Passout students */
    const studentQuery = { status: "passout" };

    if (year) {
      studentQuery.history = {
        $elemMatch: { action: "passout", academicYear: year }
      };
    }

    if (q) {
      studentQuery.name = { $regex: q, $options: "i" };
    }

    const passoutStudents = await Student.find(studentQuery).lean();

    const formattedStudents = passoutStudents.map(s => {
      const passout = s.history?.find(h => h.action === "passout");
      return {
        name: s.name,
        lastClass: s.className,
        fatherName: s.fatherName,
        mobile: s.fatherMobile || s.mobile,
        academicYear: passout?.academicYear || "",
        source: "student"
      };
    });

    /* Manual alumni */
    const alumniQuery = {};
    if (year) alumniQuery.academicYear = year;
    if (q) alumniQuery.name = { $regex: q, $options: "i" };

    const manualAlumni = await Alumni.find(alumniQuery).lean();

    /* Merge */
    const result = [...formattedStudents, ...manualAlumni].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    return res.json(result);
  }

  /* ---------- POST : ADD MANUAL ALUMNI ---------- */
  if (req.method === "POST") {
    const { name, lastClass, fatherName, mobile, academicYear } = req.body;

    if (!name || !academicYear) {
      return res.status(400).json({ error: "Name & Academic Year required" });
    }

    const alumni = new Alumni({
      name,
      lastClass,
      fatherName,
      mobile,
      academicYear
    });

    await alumni.save();
    return res.json(alumni);
  }

  res.status(405).json({ error: "Method not allowed" });
}
