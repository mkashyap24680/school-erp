const { TimetableSlot, SchoolClass, Teacher, Student } = require("../models");
const { logAction } = require("../utils/audit");

// GET /api/timetable?class_id=
exports.getTimetable = async (req, res) => {
  try {
    const where = {};
    if (req.query.class_id) where.class_id = req.query.class_id;

    const slots = await TimetableSlot.findAll({
      where,
      include: [
        { model: SchoolClass, attributes: ["id", "name", "section"] },
        { model: Teacher, attributes: ["id", "name"] },
      ],
      order: [["day_of_week", "ASC"], ["period", "ASC"]],
    });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch timetable.", error: err.message });
  }
};

// GET /api/timetable/me - student's own class timetable, or teacher's own slots
exports.getMyTimetable = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === "student") {
      const student = await Student.findOne({ where: { user_id: req.user.id } });
      if (!student || !student.class_id) return res.json([]);
      where = { class_id: student.class_id };
    } else if (req.user.role === "teacher") {
      const teacher = await Teacher.findOne({ where: { user_id: req.user.id } });
      if (!teacher) return res.json([]);
      where = { teacher_id: teacher.id };
    }

    const slots = await TimetableSlot.findAll({
      where,
      include: [
        { model: SchoolClass, attributes: ["id", "name", "section"] },
        { model: Teacher, attributes: ["id", "name"] },
      ],
      order: [["day_of_week", "ASC"], ["period", "ASC"]],
    });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch timetable.", error: err.message });
  }
};

// POST /api/timetable (admin, management)
exports.createSlot = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (payload.teacher_id === "") payload.teacher_id = null;
    const slot = await TimetableSlot.create(payload);
    await logAction(req, { action: "create", entity: "TimetableSlot", entityId: slot.id, details: payload });
    res.status(201).json(slot);
  } catch (err) {
    res.status(500).json({ message: "Failed to create timetable slot.", error: err.message });
  }
};

// PUT /api/timetable/:id
exports.updateSlot = async (req, res) => {
  try {
    const slot = await TimetableSlot.findByPk(req.params.id);
    if (!slot) return res.status(404).json({ message: "Slot not found." });
    await slot.update(req.body);
    await logAction(req, { action: "update", entity: "TimetableSlot", entityId: slot.id, details: req.body });
    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: "Failed to update slot.", error: err.message });
  }
};

// DELETE /api/timetable/:id
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await TimetableSlot.findByPk(req.params.id);
    if (!slot) return res.status(404).json({ message: "Slot not found." });
    await logAction(req, { action: "delete", entity: "TimetableSlot", entityId: slot.id });
    await slot.destroy();
    res.json({ message: "Slot deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete slot.", error: err.message });
  }
};
