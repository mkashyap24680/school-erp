const { Student, SchoolClass, Attendance, Fee, Result, Exam } = require("../models");

// GET /api/parent/children - list of children linked to this parent account
exports.getMyChildren = async (req, res) => {
  try {
    const children = await Student.findAll({
      where: { guardian_user_id: req.user.id },
      include: [{ model: SchoolClass, attributes: ["id", "name", "section"] }],
    });
    res.json(children);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch children.", error: err.message });
  }
};

async function assertOwnChild(req, res, studentId) {
  const student = await Student.findOne({ where: { id: studentId, guardian_user_id: req.user.id } });
  if (!student) {
    res.status(403).json({ message: "This student is not linked to your account." });
    return null;
  }
  return student;
}

// GET /api/parent/children/:studentId/attendance
exports.getChildAttendance = async (req, res) => {
  try {
    const student = await assertOwnChild(req, res, req.params.studentId);
    if (!student) return;
    const records = await Attendance.findAll({ where: { student_id: student.id }, order: [["date", "DESC"]] });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance.", error: err.message });
  }
};

// GET /api/parent/children/:studentId/fees
exports.getChildFees = async (req, res) => {
  try {
    const student = await assertOwnChild(req, res, req.params.studentId);
    if (!student) return;
    const fees = await Fee.findAll({ where: { student_id: student.id }, order: [["due_date", "ASC"]] });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch fees.", error: err.message });
  }
};

// GET /api/parent/children/:studentId/results
exports.getChildResults = async (req, res) => {
  try {
    const student = await assertOwnChild(req, res, req.params.studentId);
    if (!student) return;
    const results = await Result.findAll({
      where: { student_id: student.id },
      include: [{ model: Exam, attributes: ["id", "name", "subject", "exam_date", "total_marks"] }],
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch results.", error: err.message });
  }
};
