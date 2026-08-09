const {
  Student,
  Teacher,
  SchoolClass,
  Attendance,
  Fee,
} = require("../models");

const { Op } = require("sequelize");

// GET /api/dashboard/stats
exports.getStats = async (req, res) => {
  try {
    // --------------------------------------------------
    // STUDENT DASHBOARD
    // --------------------------------------------------
    // Student login ke case mein uski current academic
    // information return karenge.
    // --------------------------------------------------
    if (req.user?.role === "student") {
      const student = await Student.findOne({
        where: {
          user_id: req.user.id,
        },
      });

      if (!student) {
        return res.status(404).json({
          message: "Student profile not found.",
        });
      }

      let currentClass = null;

      if (student.class_id) {
        currentClass = await SchoolClass.findByPk(student.class_id, {
          attributes: [
            "id",
            "course_name",
            "course_code",
            "department_name",
            "department_code",
            "year",
            "semester",
            "session",
            "section",
          ],
        });
      }

      return res.json({
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          roll_no: student.roll_no,
          admission_no: student.admission_no,
        },

        currentAcademic: currentClass
          ? {
              class_id: currentClass.id,
              course_name: currentClass.course_name,
              course_code: currentClass.course_code,
              department_name: currentClass.department_name,
              department_code: currentClass.department_code,
              year: currentClass.year,
              semester: currentClass.semester,
              session: currentClass.session,
              section: currentClass.section,
            }
          : null,
      });
    }

    // --------------------------------------------------
    // ADMIN / MANAGEMENT / TEACHER DASHBOARD
    // --------------------------------------------------

    const [studentCount, teacherCount, classCount] =
      await Promise.all([
        Student.count(),
        Teacher.count(),
        SchoolClass.count(),
      ]);

    const today = new Date().toISOString().slice(0, 10);

    const todayAttendance = await Attendance.findAll({
      where: {
        date: today,
      },
    });

    const present = todayAttendance.filter(
      (a) => a.status === "present"
    ).length;

    const attendancePercent = todayAttendance.length
      ? Math.round(
          (present / todayAttendance.length) * 100
        )
      : 0;

    const pendingFees = await Fee.count({
      where: {
        status: {
          [Op.in]: ["unpaid", "partial"],
        },
      },
    });

    res.json({
      students: studentCount,
      teachers: teacherCount,
      classes: classCount,
      attendancePercent,
      pendingFees,
    });
  } catch (err) {
    console.error("getStats:", err);

    res.status(500).json({
      message: "Failed to fetch dashboard stats.",
      error: err.message,
    });
  }
};

// GET /api/dashboard/attendance-trend
// Last 7 days present percentage
exports.getAttendanceTrend = async (req, res) => {
  try {
    // Student ko attendance trend ki zarurat nahi.
    // Empty array return kar denge.
    if (req.user?.role === "student") {
      return res.json([]);
    }

    const days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();

      d.setDate(d.getDate() - i);

      days.push(
        d.toISOString().slice(0, 10)
      );
    }

    const trend = [];

    for (const day of days) {
      const records = await Attendance.findAll({
        where: {
          date: day,
        },
      });

      const present = records.filter(
        (r) => r.status === "present"
      ).length;

      trend.push({
        date: day,
        percent: records.length
          ? Math.round(
              (present / records.length) * 100
            )
          : 0,
      });
    }

    res.json(trend);
  } catch (err) {
    console.error("getAttendanceTrend:", err);

    res.status(500).json({
      message: "Failed to fetch attendance trend.",
      error: err.message,
    });
  }
};
