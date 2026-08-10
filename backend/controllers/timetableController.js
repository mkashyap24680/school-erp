const {
  TimetableSlot,
  SchoolClass,
  Teacher,
  Student,
} = require("../models");

const { logAction } = require("../utils/audit");

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const getTimeMinutes = (time) => {
  if (!time) return 0;

  const [hours, minutes] = String(time)
    .slice(0, 5)
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
};

const isTimeOverlap = (
  startA,
  endA,
  startB,
  endB
) => {
  return (
    getTimeMinutes(startA) <
      getTimeMinutes(endB) &&
    getTimeMinutes(endA) >
      getTimeMinutes(startB)
  );
};

// --------------------------------------------------
// CHECK TEACHER / CLASS CONFLICT
// --------------------------------------------------

const checkConflict = async ({
  class_id,
  teacher_id,
  day,
  start_time,
  end_time,
  excludeId = null,
}) => {
  const slots = await TimetableSlot.findAll({
    where: {
      day,
    },
  });

  for (const slot of slots) {
    // Current slot ko ignore karo while editing
    if (
      excludeId &&
      String(slot.id) === String(excludeId)
    ) {
      continue;
    }

    const overlap = isTimeOverlap(
      start_time,
      end_time,
      slot.start_time,
      slot.end_time
    );

    if (!overlap) {
      continue;
    }

    // Teacher conflict
    if (
      teacher_id &&
      String(slot.teacher_id) === String(teacher_id)
    ) {
      return {
        type: "teacher",
        message:
          "This teacher already has another class during this time.",
      };
    }

    // Class conflict
    if (
      String(slot.class_id) === String(class_id)
    ) {
      return {
        type: "class",
        message:
          "This class already has another subject during this time.",
      };
    }
  }

  return null;
};

// --------------------------------------------------
// GET ALL TIMETABLE
// GET /api/timetable
// --------------------------------------------------

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
            "name",
            "section",
          ],
        },
        {
          model: Teacher,
          attributes: [
            "id",
            "name",
          ],
        },
      ],

      order: [
        ["day", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    res.json(slots);
  } catch (err) {
    console.error(
      "Get timetable error:",
      err
    );

    res.status(500).json({
      message: "Failed to fetch timetable.",
      error: err.message,
    });
  }
};

// --------------------------------------------------
// GET MY TIMETABLE
// GET /api/timetable/me
// --------------------------------------------------

exports.getMyTimetable = async (
  req,
  res
) => {
  try {
    let where = {};

    // Student
    if (req.user.role === "student") {
      const student =
        await Student.findOne({
          where: {
            user_id: req.user.id,
          },
        });

      if (
        !student ||
        !student.class_id
      ) {
        return res.json([]);
      }

      where.class_id = student.class_id;
    }

    // Teacher
    else if (
      req.user.role === "teacher"
    ) {
      const teacher =
        await Teacher.findOne({
          where: {
            user_id: req.user.id,
          },
        });

      if (!teacher) {
        return res.json([]);
      }

      where.teacher_id = teacher.id;
    }

    const slots =
      await TimetableSlot.findAll({
        where,

        include: [
          {
            model: SchoolClass,
            attributes: [
              "id",
              "name",
              "section",
            ],
          },
          {
            model: Teacher,
            attributes: [
              "id",
              "name",
            ],
          },
        ],

        order: [
          ["day", "ASC"],
          ["start_time", "ASC"],
        ],
      });

    res.json(slots);
  } catch (err) {
    console.error(
      "Get my timetable error:",
      err
    );

    res.status(500).json({
      message:
        "Failed to fetch my timetable.",
      error: err.message,
    });
  }
};

// --------------------------------------------------
// CREATE TIMETABLE
// POST /api/timetable
// --------------------------------------------------

exports.createSlot = async (
  req,
  res
) => {
  try {
    const {
      class_id,
      teacher_id,
      subject,
      day,
      start_time,
      end_time,
      room,
    } = req.body;

    // Basic validation
    if (
      !class_id ||
      !teacher_id ||
      !subject ||
      !day ||
      !start_time ||
      !end_time
    ) {
      return res.status(400).json({
        message:
          "Class, teacher, subject, day, start time and end time are required.",
      });
    }

    // Time validation
    if (
      getTimeMinutes(end_time) <=
      getTimeMinutes(start_time)
    ) {
      return res.status(400).json({
        message:
          "End time must be after start time.",
      });
    }

    // Conflict check
    const conflict =
      await checkConflict({
        class_id,
        teacher_id,
        day,
        start_time,
        end_time,
      });

    if (conflict) {
      return res.status(409).json({
        message: conflict.message,
        conflict_type:
          conflict.type,
      });
    }

    const payload = {
      class_id,
      teacher_id,
      subject: subject.trim(),
      day,
      start_time,
      end_time,
      room: room
        ? room.trim()
        : null,
    };

    const slot =
      await TimetableSlot.create(
        payload
      );

    await logAction(req, {
      action: "create",
      entity: "TimetableSlot",
      entityId: slot.id,
      details: payload,
    });

    res.status(201).json(slot);
  } catch (err) {
    console.error(
      "Create timetable error:",
      err
    );

    res.status(500).json({
      message:
        "Failed to create timetable slot.",
      error: err.message,
    });
  }
};

// --------------------------------------------------
// UPDATE TIMETABLE
// PUT /api/timetable/:id
// --------------------------------------------------

exports.updateSlot = async (
  req,
  res
) => {
  try {
    const slot =
      await TimetableSlot.findByPk(
        req.params.id
      );

    if (!slot) {
      return res.status(404).json({
        message:
          "Timetable slot not found.",
      });
    }

    const {
      class_id,
      teacher_id,
      subject,
      day,
      start_time,
      end_time,
      room,
    } = req.body;

    if (
      !class_id ||
      !teacher_id ||
      !subject ||
      !day ||
      !start_time ||
      !end_time
    ) {
      return res.status(400).json({
        message:
          "Class, teacher, subject, day, start time and end time are required.",
      });
    }

    if (
      getTimeMinutes(end_time) <=
      getTimeMinutes(start_time)
    ) {
      return res.status(400).json({
        message:
          "End time must be after start time.",
      });
    }

    // Conflict check excluding current slot
    const conflict =
      await checkConflict({
        class_id,
        teacher_id,
        day,
        start_time,
        end_time,
        excludeId: slot.id,
      });

    if (conflict) {
      return res.status(409).json({
        message: conflict.message,
        conflict_type:
          conflict.type,
      });
    }

    const payload = {
      class_id,
      teacher_id,
      subject: subject.trim(),
      day,
      start_time,
      end_time,
      room: room
        ? room.trim()
        : null,
    };

    await slot.update(payload);

    await logAction(req, {
      action: "update",
      entity: "TimetableSlot",
      entityId: slot.id,
      details: payload,
    });

    res.json(slot);
  } catch (err) {
    console.error(
      "Update timetable error:",
      err
    );

    res.status(500).json({
      message:
        "Failed to update timetable slot.",
      error: err.message,
    });
  }
};

// --------------------------------------------------
// DELETE TIMETABLE
// DELETE /api/timetable/:id
// --------------------------------------------------

exports.deleteSlot = async (
  req,
  res
) => {
  try {
    const slot =
      await TimetableSlot.findByPk(
        req.params.id
      );

    if (!slot) {
      return res.status(404).json({
        message:
          "Timetable slot not found.",
      });
    }

    await logAction(req, {
      action: "delete",
      entity: "TimetableSlot",
      entityId: slot.id,
    });

    await slot.destroy();

    res.json({
      message:
        "Timetable slot deleted successfully.",
    });
  } catch (err) {
    console.error(
      "Delete timetable error:",
      err
    );

    res.status(500).json({
      message:
        "Failed to delete timetable slot.",
      error: err.message,
    });
  }
};
