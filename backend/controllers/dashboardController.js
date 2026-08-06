const { Student, Teacher, SchoolClass, Attendance, Fee } = require("../models");
const { Op, fn, col } = require("sequelize");

// GET /api/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    const [studentCount, teacherCount, classCount] = await Promise.all([
      Student.count(),
      Teacher.count(),
      SchoolClass.count(),
    ]);

    const today = new Date().toISOString().slice(0, 10);
    const todayAttendance = await Attendance.findAll({ where: { date: today } });
    const present = todayAttendance.filter((a) => a.status === "present").length;
    const attendancePercent = todayAttendance.length
      ? Math.round((present / todayAttendance.length) * 100)
      : 0;

    const pendingFees = await Fee.count({ where: { status: { [Op.in]: ["unpaid", "partial"] } } });

    res.json({
      students: studentCount,
      teachers: teacherCount,
      classes: classCount,
      attendancePercent,
      pendingFees,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch dashboard stats.", error: err.message });
  }
};

// GET /api/dashboard/attendance-trend  -> last 7 days present % (for chart)
exports.getAttendanceTrend = async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    const trend = [];
    for (const day of days) {
      const records = await Attendance.findAll({ where: { date: day } });
      const present = records.filter((r) => r.status === "present").length;
      trend.push({
        date: day,
        percent: records.length ? Math.round((present / records.length) * 100) : 0,
      });
    }

    res.json(trend);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch attendance trend.", error: err.message });
  }
};
