const { SchoolClass, Teacher, Student } = require("../models");

// GET /api/classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await SchoolClass.findAll({
      include: [
        { model: Teacher, as: "classTeacher", attributes: ["id", "name"] },
        { model: Student, attributes: ["id"] },
      ],
      order: [["name", "ASC"], ["section", "ASC"]],
    });

    const withCounts = classes.map((c) => {
      const json = c.toJSON();
      json.studentCount = json.Students ? json.Students.length : 0;
      delete json.Students;
      return json;
    });

    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch classes.", error: err.message });
  }
};

// GET /api/classes/:id
exports.getClassById = async (req, res) => {
  try {
    const schoolClass = await SchoolClass.findByPk(req.params.id, {
      include: [
        { model: Teacher, as: "classTeacher", attributes: ["id", "name"] },
        { model: Student, attributes: ["id", "name", "roll_no"] },
      ],
    });
    if (!schoolClass) return res.status(404).json({ message: "Class not found." });
    res.json(schoolClass);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch class.", error: err.message });
  }
};

// POST /api/classes  (admin, management)
exports.createClass = async (req, res) => {
  try {
    const schoolClass = await SchoolClass.create(req.body);
    res.status(201).json(schoolClass);
  } catch (err) {
    res.status(500).json({ message: "Failed to create class.", error: err.message });
  }
};

// PUT /api/classes/:id
exports.updateClass = async (req, res) => {
  try {
    const schoolClass = await SchoolClass.findByPk(req.params.id);
    if (!schoolClass) return res.status(404).json({ message: "Class not found." });
    await schoolClass.update(req.body);
    res.json(schoolClass);
  } catch (err) {
    res.status(500).json({ message: "Failed to update class.", error: err.message });
  }
};

// DELETE /api/classes/:id (admin only)
exports.deleteClass = async (req, res) => {
  try {
    const schoolClass = await SchoolClass.findByPk(req.params.id);
    if (!schoolClass) return res.status(404).json({ message: "Class not found." });
    await schoolClass.destroy();
    res.json({ message: "Class deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete class.", error: err.message });
  }
};
