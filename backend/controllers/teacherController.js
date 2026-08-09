const { Teacher, SchoolClass } = require("../models");

// GET /api/teachers
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll({
      include: [{ model: SchoolClass, as: "classesHandled", attributes: ["id", "course_name", "department_name", "section"] }],
      order: [["name", "ASC"]],
    });
    res.json(teachers);
  } catch (err) {
    console.error("getAllTeachers error:", err);
    res.status(500).json({ message: "Failed to fetch teachers.", error: err.message });
  }
};

// GET /api/teachers/:id
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      include: [{ model: SchoolClass, as: "classesHandled" }],
    });
    if (!teacher) return res.status(404).json({ message: "Teacher not found." });
    res.json(teacher);
  } catch (err) {
    console.error("getTeacherById error:", err);
    res.status(500).json({ message: "Failed to fetch teacher.", error: err.message });
  }
};

// GET /api/teachers/me/profile (teacher role)
exports.getMyTeacherProfile = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({
      where: { user_id: req.user.id },
      include: [{ model: SchoolClass, as: "classesHandled" }],
    });
    if (!teacher) return res.status(404).json({ message: "Teacher profile not found." });
    res.json(teacher);
  } catch (err) {
    console.error("getMyTeacherProfile error:", err);
    res.status(500).json({ message: "Failed to fetch profile.", error: err.message });
  }
};

// POST /api/teachers  (admin, management)
exports.createTeacher = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.joining_date) payload.joining_date = null;

    const teacher = await Teacher.create(payload);
    res.status(201).json(teacher);
  } catch (err) {
    console.error("createTeacher error:", err);

    const details = err.errors
      ? err.errors.map((e) => ({ field: e.path, message: e.message, value: e.value }))
      : undefined;

    res.status(500).json({
      message: "Failed to create teacher.",
      error: err.message,
      details,
      original: err.original?.sqlMessage,
    });
  }
};

// PUT /api/teachers/:id
exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found." });

    const payload = { ...req.body };
    if (!payload.joining_date) payload.joining_date = null;

    await teacher.update(payload);
    res.json(teacher);
  } catch (err) {
    console.error("updateTeacher error:", err);
    res.status(500).json({ message: "Failed to update teacher.", error: err.message });
  }
};

// POST /api/teachers/bulk (admin, management) - CSV/Excel bulk import
exports.bulkCreateTeachers = async (req, res) => {
  try {
    const { teachers } = req.body;
    if (!Array.isArray(teachers) || teachers.length === 0) {
      return res.status(400).json({ message: "teachers[] is required." });
    }

    const created = [];
    const errors = [];
    for (let i = 0; i < teachers.length; i++) {
      try {
        const row = { ...teachers[i] };
        if (!row.name) { errors.push({ row: i + 1, error: "Missing name" }); continue; }
        if (!row.joining_date) row.joining_date = null;

        const teacher = await Teacher.create(row);
        created.push(teacher);
      } catch (err) {
        errors.push({ row: i + 1, error: err.message });
      }
    }

    res.status(201).json({ created: created.length, errors });
  } catch (err) {
    console.error("bulkCreateTeachers error:", err);
    res.status(500).json({ message: "Bulk import failed.", error: err.message });
  }
};

// DELETE /api/teachers/:id (admin only)
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) return res.status(404).json({ message: "Teacher not found." });
    await teacher.destroy();
    res.json({ message: "Teacher deleted." });
  } catch (err) {
    console.error("deleteTeacher error:", err);
    res.status(500).json({ message: "Failed to delete teacher.", error: err.message });
  }
};
