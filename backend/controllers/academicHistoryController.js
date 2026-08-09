const {
  StudentAcademicHistory,
  Student,
  SchoolClass,
} = require("../models");

// GET /api/academic-history/student/:studentId
exports.getStudentAcademicHistory = async (req, res) => {
  try {
    const history = await StudentAcademicHistory.findAll({
      where: {
        student_id: req.params.studentId,
      },
      include: [
        {
          model: SchoolClass,
          as: "class",
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
        },
      ],
      order: [["session", "DESC"]],
    });

    res.json(history);
  } catch (err) {
    console.error("getStudentAcademicHistory:", err);

    res.status(500).json({
      message: "Failed to fetch academic history.",
      error: err.message,
    });
  }
};

// POST /api/academic-history
exports.createAcademicHistory = async (req, res) => {
  try {
    const {
      student_id,
      class_id,
      session,
      year,
      semester,
      section,
      start_date,
      end_date,
      status,
    } = req.body;

    if (!student_id) {
      return res.status(400).json({
        message: "Student is required.",
      });
    }

    if (!class_id) {
      return res.status(400).json({
        message: "Class is required.",
      });
    }

    if (!session) {
      return res.status(400).json({
        message: "Session is required.",
      });
    }

    if (!year) {
      return res.status(400).json({
        message: "Year is required.",
      });
    }

    if (!semester) {
      return res.status(400).json({
        message: "Semester is required.",
      });
    }

    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    const schoolClass = await SchoolClass.findByPk(class_id);

    if (!schoolClass) {
      return res.status(404).json({
        message: "Class not found.",
      });
    }

    const history = await StudentAcademicHistory.create({
      student_id,
      class_id,
      session,
      year,
      semester,
      section: section || null,
      start_date: start_date || null,
      end_date: end_date || null,
      status: status || "active",
    });

    res.status(201).json(history);
  } catch (err) {
    console.error("createAcademicHistory:", err);

    res.status(500).json({
      message: "Failed to create academic history.",
      error: err.message,
    });
  }
};

// PUT /api/academic-history/:id
exports.updateAcademicHistory = async (req, res) => {
  try {
    const history = await StudentAcademicHistory.findByPk(req.params.id);

    if (!history) {
      return res.status(404).json({
        message: "Academic history not found.",
      });
    }

    await history.update(req.body);

    res.json(history);
  } catch (err) {
    console.error("updateAcademicHistory:", err);

    res.status(500).json({
      message: "Failed to update academic history.",
      error: err.message,
    });
  }
};
