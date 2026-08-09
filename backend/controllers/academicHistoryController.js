const {
  StudentAcademicHistory,
  Student,
  SchoolClass,
} = require("../models");

const sequelize = require("../config/db");

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
      order: [["start_date", "DESC"]],
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

    if (!session?.trim()) {
      return res.status(400).json({
        message: "Session is required.",
      });
    }

    if (!year?.trim()) {
      return res.status(400).json({
        message: "Year is required.",
      });
    }

    if (!semester?.trim()) {
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
      session: session.trim(),
      year: year.trim(),
      semester: semester.trim(),
      section: section?.trim() || null,
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

// POST /api/academic-history/promote/:studentId
// Promote student to a new session/year/semester/class
exports.promoteStudent = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { studentId } = req.params;

    const {
      class_id,
      session,
      year,
      semester,
      section,
      start_date,
    } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!class_id) {
      await transaction.rollback();

      return res.status(400).json({
        message: "New class is required.",
      });
    }

    if (!session?.trim()) {
      await transaction.rollback();

      return res.status(400).json({
        message: "New session is required.",
      });
    }

    if (!year?.trim()) {
      await transaction.rollback();

      return res.status(400).json({
        message: "New year is required.",
      });
    }

    if (!semester?.trim()) {
      await transaction.rollback();

      return res.status(400).json({
        message: "New semester is required.",
      });
    }

    // -----------------------------
    // FIND STUDENT
    // -----------------------------

    const student = await Student.findByPk(studentId, {
      transaction,
    });

    if (!student) {
      await transaction.rollback();

      return res.status(404).json({
        message: "Student not found.",
      });
    }

    // -----------------------------
    // FIND NEW CLASS
    // -----------------------------

    const newClass = await SchoolClass.findByPk(class_id, {
      transaction,
    });

    if (!newClass) {
      await transaction.rollback();

      return res.status(404).json({
        message: "New class not found.",
      });
    }

    // -----------------------------
    // FIND CURRENT ACTIVE HISTORY
    // -----------------------------

    const currentHistory = await StudentAcademicHistory.findOne({
      where: {
        student_id: studentId,
        status: "active",
      },
      order: [["start_date", "DESC"]],
      transaction,
    });

    // -----------------------------
    // COMPLETE OLD HISTORY
    // -----------------------------

    if (currentHistory) {
      await currentHistory.update(
        {
          status: "completed",
          end_date: start_date || new Date(),
        },
        {
          transaction,
        }
      );
    }

    // -----------------------------
    // CREATE NEW HISTORY
    // -----------------------------

    const newHistory = await StudentAcademicHistory.create(
      {
        student_id: studentId,
        class_id,
        session: session.trim(),
        year: year.trim(),
        semester: semester.trim(),
        section: section?.trim() || null,
        start_date: start_date || new Date(),
        end_date: null,
        status: "active",
      },
      {
        transaction,
      }
    );

    // -----------------------------
    // UPDATE STUDENT CURRENT CLASS
    // -----------------------------

    await student.update(
      {
        class_id,
      },
      {
        transaction,
      }
    );

    // -----------------------------
    // COMMIT
    // -----------------------------

    await transaction.commit();

    // -----------------------------
    // RETURN COMPLETE RESULT
    // -----------------------------

    const result = await StudentAcademicHistory.findByPk(
      newHistory.id,
      {
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
      }
    );

    res.status(201).json({
      message: "Student promoted successfully.",
      history: result,
    });
  } catch (err) {
    // Rollback only if transaction is still active
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      console.error("Transaction rollback error:", rollbackError);
    }

    console.error("promoteStudent:", err);

    res.status(500).json({
      message: "Failed to promote student.",
      error: err.message,
    });
  }
};
