const {
  TimetableSlot,
  Student,
  SchoolClass,
  Teacher,
} = require("../models");

// ---------------------------------------------------------
// GET /api/timetable
// admin, management, teacher
// Optional:
// ?class_id=
// ?teacher_id=
// ?day=
// ---------------------------------------------------------

exports.getTimetable = async (req, res) => {
  try {
    const where = {};

    if (req.query.class_id) {
      where.class_id = req.query.class_id;
    }

    if (req.query.teacher_id) {
      where.teacher_id = req.query.teacher_id;
    }

    if (req.query.day) {
      where.day = req.query.day;
    }

    const slots = await TimetableSlot.findAll({
      where,
      include: [
        {
          model: SchoolClass,
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
        {
          model: Teacher,
          attributes: ["id", "name"],
        },
      ],
      order: [
        ["day", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    res.json(slots);
  } catch (err) {
    console.error("getTimetable:", err);

    res.status(500).json({
      message: "Failed to fetch timetable.",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------
// GET /api/timetable/me
// Student / Teacher
// Student: ONLY their own class timetable
// Teacher: their own timetable
// ---------------------------------------------------------

exports.getMyTimetable = async (req, res) => {
  try {
    // -----------------------------------------------------
    // Student
    // -----------------------------------------------------

    if (req.user.role === "student") {
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

      if (!student.class_id) {
        return res.json([]);
      }

      const slots = await TimetableSlot.findAll({
        where: {
          class_id: student.class_id,
        },
        include: [
          {
            model: SchoolClass,
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
          {
            model: Teacher,
            attributes: ["id", "name"],
          },
        ],
        order: [
          ["day", "ASC"],
          ["start_time", "ASC"],
        ],
      });

      return res.json(slots);
    }

    // -----------------------------------------------------
    // Teacher
    // -----------------------------------------------------

    if (req.user.role === "teacher") {
      const teacher = await Teacher.findOne({
        where: {
          user_id: req.user.id,
        },
      });

      if (!teacher) {
        return res.status(404).json({
          message: "Teacher profile not found.",
        });
      }

      const slots = await TimetableSlot.findAll({
        where: {
          teacher_id: teacher.id,
        },
        include: [
          {
            model: SchoolClass,
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
          {
            model: Teacher,
            attributes: ["id", "name"],
          },
        ],
        order: [
          ["day", "ASC"],
          ["start_time", "ASC"],
        ],
      });

      return res.json(slots);
    }

    return res.status(403).json({
      message: "Access denied.",
    });
  } catch (err) {
    console.error("getMyTimetable:", err);

    res.status(500).json({
      message: "Failed to fetch your timetable.",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------
// POST /api/timetable
// admin, management
// ---------------------------------------------------------

exports.createSlot = async (req, res) => {
  try {
    const slot = await TimetableSlot.create(req.body);

    res.status(201).json(slot);
  } catch (err) {
    console.error("createSlot:", err);

    res.status(500).json({
      message: "Failed to create timetable slot.",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------
// PUT /api/timetable/:id
// admin, management
// ---------------------------------------------------------

exports.updateSlot = async (req, res) => {
  try {
    const slot = await TimetableSlot.findByPk(req.params.id);

    if (!slot) {
      return res.status(404).json({
        message: "Timetable slot not found.",
      });
    }

    await slot.update(req.body);

    res.json(slot);
  } catch (err) {
    console.error("updateSlot:", err);

    res.status(500).json({
      message: "Failed to update timetable slot.",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------
// DELETE /api/timetable/:id
// admin, management
// ---------------------------------------------------------

exports.deleteSlot = async (req, res) => {
  try {
    const slot = await TimetableSlot.findByPk(req.params.id);

    if (!slot) {
      return res.status(404).json({
        message: "Timetable slot not found.",
      });
    }

    await slot.destroy();

    res.json({
      message: "Timetable slot deleted.",
    });
  } catch (err) {
    console.error("deleteSlot:", err);

    res.status(500).json({
      message: "Failed to delete timetable slot.",
      error: err.message,
    });
  }
};
