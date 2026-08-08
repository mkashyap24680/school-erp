const { SchoolClass, Teacher, Student } = require("../models");

// GET /api/classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await SchoolClass.findAll({
      include: [
        {
          model: Teacher,
          as: "classTeacher",
          attributes: ["id", "name"],
        },
        {
          model: Student,
          attributes: ["id"],
        },
      ],
      order: [
        ["course_name", "ASC"],
        ["department_name", "ASC"],
        ["section", "ASC"],
      ],
    });

    const result = classes.map((c) => {
      const json = c.toJSON();

      json.studentCount = json.Students
        ? json.Students.length
        : 0;

      delete json.Students;

      return json;
    });

    res.json(result);
  } catch (err) {
    console.error("getAllClasses:", err);

    res.status(500).json({
      message: "Failed to fetch classes.",
      error: err.message,
    });
  }
};

// GET /api/classes/:id
exports.getClassById = async (req, res) => {
  try {
    const schoolClass = await SchoolClass.findByPk(req.params.id, {
      include: [
        {
          model: Teacher,
          as: "classTeacher",
          attributes: ["id", "name"],
        },
        {
          model: Student,
          attributes: ["id", "name", "roll_no"],
        },
      ],
    });

    if (!schoolClass) {
      return res.status(404).json({
        message: "Class not found.",
      });
    }

    res.json(schoolClass);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch class.",
      error: err.message,
    });
  }
};

// POST /api/classes
exports.createClass = async (req, res) => {
  try {
    const {
      course_name,
      course_code,
      department_name,
      department_code,
      section,
      teacher_id,
    } = req.body;

    if (!course_name?.trim()) {
      return res.status(400).json({
        message: "Course name is required.",
      });
    }

    if (!department_name?.trim()) {
      return res.status(400).json({
        message: "Department name is required.",
      });
    }

    const schoolClass = await SchoolClass.create({
      course_name: course_name.trim(),
      course_code: course_code?.trim() || null,
      department_name: department_name.trim(),
      department_code: department_code?.trim() || null,
      section: section?.trim() || null,
      teacher_id: teacher_id || null,
    });

    res.status(201).json(schoolClass);
  } catch (err) {
    console.error("createClass:", err);

    res.status(500).json({
      message: "Failed to create class.",
      error: err.message,
    });
  }
};

// PUT /api/classes/:id
exports.updateClass = async (req, res) => {
  try {
    const schoolClass = await SchoolClass.findByPk(req.params.id);

    if (!schoolClass) {
      return res.status(404).json({
        message: "Class not found.",
      });
    }

    const {
      course_name,
      course_code,
      department_name,
      department_code,
      section,
      teacher_id,
    } = req.body;

    if (!course_name?.trim()) {
      return res.status(400).json({
        message: "Course name is required.",
      });
    }

    if (!department_name?.trim()) {
      return res.status(400).json({
        message: "Department name is required.",
      });
    }

    await schoolClass.update({
      course_name: course_name.trim(),
      course_code: course_code?.trim() || null,
      department_name: department_name.trim(),
      department_code: department_code?.trim() || null,
      section: section?.trim() || null,
      teacher_id: teacher_id || null,
    });

    res.json(schoolClass);
  } catch (err) {
    console.error("updateClass:", err);

    res.status(500).json({
      message: "Failed to update class.",
      error: err.message,
    });
  }
};

// DELETE /api/classes/:id
exports.deleteClass = async (req, res) => {
  try {
    const schoolClass = await SchoolClass.findByPk(req.params.id);

    if (!schoolClass) {
      return res.status(404).json({
        message: "Class not found.",
      });
    }

    await schoolClass.destroy();

    res.json({
      message: "Class deleted.",
    });
  } catch (err) {
    console.error("deleteClass:", err);

    res.status(500).json({
      message: "Failed to delete class.",
      error: err.message,
    });
  }
};
