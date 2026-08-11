const {
  Student,
  SchoolClass,
  User,
  Attendance,
  Fee,
  Result,
} = require("../models");

const { logAction } = require("../utils/audit");

// ---------------------------------------------------------
// SchoolClass fields
// ---------------------------------------------------------

const classAttributes = [
  "id",
  "course_name",
  "course_code",
  "department_name",
  "department_code",
  "year",
  "semester",
  "session",
  "section",
];

// ---------------------------------------------------------
// GET /api/students
// admin, management, teacher
// ---------------------------------------------------------

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.findAll({
      include: [
        {
          model: SchoolClass,
          attributes: classAttributes,
        },
      ],
      order: [["name", "ASC"]],
    });

    res.json(students);
  } catch (err) {
    console.error("getAllStudents:", err);

    res.status(500).json({
      message: "Failed to fetch students.",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------
// GET /api/students/:id
// admin, management, teacher
// ---------------------------------------------------------

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        {
          model: SchoolClass,
          attributes: classAttributes,
        },
      ],
    });

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    res.json(student);
  } catch (err) {
    console.error("getStudentById:", err);

    res.status(500).json({
      message: "Failed to fetch student.",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------
// GET /api/students/me/profile
// Student - ONLY their own profile
// ---------------------------------------------------------

exports.getMyStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: {
        user_id: req.user.id,
      },
      include: [
        {
          model: SchoolClass,
          attributes: classAttributes,
        },
      ],
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found.",
      });
    }

    res.json(student);
  } catch (err) {
    console.error("getMyStudentProfile:", err);

    res.status(500).json({
      message: "Failed to fetch profile.",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------
// GET /api/students/me/dashboard
// Student - ONLY their own data
// ---------------------------------------------------------

exports.getMyStudentDashboard = async (req, res) => {
  try {
    const student = await Student.findOne({
      where: {
        user_id: req.user.id,
      },
      include: [
        {
          model: SchoolClass,
          attributes: classAttributes,
        },
      ],
    });

    if (!student) {
      return res.status(404).json({
        message: "Student profile not found.",
      });
    }

    res.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        roll_no: student.roll_no,
        admission_no: student.admission_no,
        class_id: student.class_id,
        class: student.SchoolClass || null,
      },
    });
  } catch (err) {
    console.error("getMyStudentDashboard:", err);

    res.status(500).json({
      message: "Failed to fetch student dashboard.",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------
// POST /api/students
// admin, management
// ---------------------------------------------------------

exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);

    await logAction(req, {
      action: "create",
      entity: "Student",
      entityId: student.id,
      details: {
        name: student.name,
      },
    });

    res.status(201).json(student);
  } catch (err) {
    console.error("createStudent:", err);

    res.status(500).json({
      message: "Failed to create student.",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------
// PUT /api/students/:id
// admin, management
// ---------------------------------------------------------

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    await student.update(req.body);

    await logAction(req, {
      action: "update",
      entity: "Student",
      entityId: student.id,
      details: req.body,
    });

    res.json(student);
  } catch (err) {
    console.error("updateStudent:", err);

    res.status(500).json({
      message: "Failed to update student.",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------
// POST /api/students/bulk
// admin, management
// ---------------------------------------------------------

exports.bulkCreateStudents = async (req, res) => {
  try {
    const { students } = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        message: "students[] is required.",
      });
    }

    const created = [];
    const errors = [];

    for (let i = 0; i < students.length; i++) {
      try {
        const row = students[i];

        if (!row.name) {
          errors.push({
            row: i + 1,
            error: "Missing name",
          });

          continue;
        }

        const student = await Student.create(row);

        created.push(student);
      } catch (err) {
        errors.push({
          row: i + 1,
          error: err.message,
        });
      }
    }

    await logAction(req, {
      action: "bulk_import",
      entity: "Student",
      details: {
        count: created.length,
      },
    });

    res.status(201).json({
      created: created.length,
      errors,
    });
  } catch (err) {
    console.error("bulkCreateStudents:", err);

    res.status(500).json({
      message: "Bulk import failed.",
      error: err.message,
    });
  }
};

// ---------------------------------------------------------
// DELETE /api/students/:id
// admin only
// ---------------------------------------------------------

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Student not found.",
      });
    }

    await logAction(req, {
      action: "delete",
      entity: "Student",
      entityId: student.id,
      details: {
        name: student.name,
      },
    });

    await student.destroy();

    res.json({
      message: "Student deleted.",
    });
  } catch (err) {
    console.error("deleteStudent:", err);

    res.status(500).json({
      message: "Failed to delete student.",
      error: err.message,
    });
  }
};
