const { Attendance, Student } = require("../models");
const { Op } = require("sequelize");
const { notifyUser } = require("../utils/notify");

// GET /api/attendance?class_id=&date=
exports.getAttendance = async (req, res) => {
  try {
    const { class_id, date, student_id } = req.query;
    const where = {};
    if (class_id) where.class_id = class_id;
    if (date) where.date = date;
    if (student_id) where.student_id = student_id;

    const records = await Attendance.findAll({
      where,
      include: [{ model: Student, attributes: ["id", "name", "roll_no"] }],
      order: [["date", "DESC"]],
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance.", error: err.message });
  }
};

// GET /api/attendance/me (student's own attendance history)
exports.getMyAttendance = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    const records = await Attendance.findAll({
      where: { student_id: student.id },
      order: [["date", "DESC"]],
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance.", error: err.message });
  }
};

// POST /api/attendance/bulk  (admin, teacher)
// body: { class_id, date, records: [{ student_id, status }] }
exports.markBulkAttendance = async (req, res) => {
  try {
    const { class_id, date, records } = req.body;
    if (!class_id || !date || !Array.isArray(records)) {
      return res.status(400).json({ message: "class_id, date and records[] are required." });
    }

    const results = [];
    for (const r of records) {
      const [attendance] = await Attendance.findOrCreate({
        where: { student_id: r.student_id, date },
        defaults: {
          class_id,
          status: r.status || "present",
          marked_by: req.user.id,
        },
      });
      if (attendance.status !== r.status) {
        attendance.status = r.status;
        attendance.marked_by = req.user.id;
        await attendance.save();
      }
      results.push(attendance);

      if (r.status === "absent") {
        const student = await Student.findByPk(r.student_id);
        if (student?.user_id) {
          await notifyUser(student.user_id, {
            title: "Marked Absent",
            message: `You were marked absent on ${date}.`,
            type: "attendance",
          });
        }
      }
    }

    res.status(201).json({ message: "Attendance saved.", records: results });
  } catch (err) {
    res.status(500).json({ message: "Failed to save attendance.", error: err.message });
  }
};

// GET /api/attendance/summary?class_id=  -> today's present/absent counts
exports.getAttendanceSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const where = { date: today };
    if (req.query.class_id) where.class_id = req.query.class_id;

    const records = await Attendance.findAll({ where });
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const leave = records.filter((r) => r.status === "leave").length;
    const total = records.length;

    res.json({
      date: today,
      total,
      present,
      absent,
      leave,
      attendancePercent: total ? Math.round((present / total) * 100) : 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch summary.", error: err.message });
  }
};
