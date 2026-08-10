const {
  TimetableSlot,
  SchoolClass,
  Teacher,
  Student,
} = require("../models");

const { logAction } = require("../utils/audit");

const DAY_MAP = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

const DAY_NAMES = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function normalizeDay(value) {
  if (typeof value === "number") {
    return value >= 1 && value <= 7 ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (DAY_MAP[trimmed]) {
      return DAY_MAP[trimmed];
    }

    const number = Number(trimmed);

    if (number >= 1 && number <= 7) {
      return number;
    }
  }

  return null;
}

function timeToMinutes(time) {
  if (!time) return null;

  const value = String(time).slice(0, 5);
  const [hours, minutes] = value.split(":").map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes)
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

function timesOverlap(
  startA,
  endA,
  startB,
  endB
) {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  if (
    aStart === null ||
    aEnd === null ||
    bStart === null ||
    bEnd === null
  ) {
    return false;
  }

  return aStart < bEnd && aEnd > bStart;
}

function formatTime(time) {
  if (!time) return "";

  return String(time).slice(0, 5);
}

// --------------------------------------------------
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

    if (req.query.day_of_week) {
      where.day_of_week = req.query.day_of_week;
    }

    const slots = await TimetableSlot.findAll({
      where,

      include: [
        {
          model: SchoolClass,
          attributes: ["id", "name", "section"],
        },
        {
          model: Teacher,
          attributes: ["id", "name"],
        },
      ],

      order: [
        ["day_of_week", "ASC"],
        ["start_time", "ASC"],
        ["period", "ASC"],
      ],
    });

    const result = slots.map((slot) => {
      const data = slot.toJSON();

      return {
        ...data,

        // Frontend friendly values
        day: DAY_NAMES[data.day_of_week] || data.day_of_week,

        class: data.SchoolClass || data.class || null,

        teacher: data.Teacher || data.teacher || null,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Get timetable error:", err);

    res.status(500).json({
      message: "Failed to fetch timetable.",
      error: err.message,
    });
  }
};

// --------------------------------------------------
// GET /api/timetable/me
// --------------------------------------------------

exports.getMyTimetable = async (req, res) => {
  try {
    let where = {};

    if (req.user.role === "student") {
      const student = await Student.findOne({
        where: {
          user_id: req.user.id,
        },
      });

      if (!student || !student.class_id) {
        return res.json([]);
      }

      where = {
        class_id: student.class_id,
      };
    } else if (req.user.role === "teacher") {
      const teacher = await Teacher.findOne({
        where: {
          user_id: req.user.id,
        },
      });

      if (!teacher) {
        return res.json([]);
      }

      where = {
        teacher_id: teacher.id,
      };
    }

    const slots = await TimetableSlot.findAll({
      where,

      include: [
        {
          model: SchoolClass,
          attributes: ["id", "name", "section"],
        },
        {
          model: Teacher,
          attributes: ["id", "name"],
        },
      ],

      order: [
        ["day_of_week", "ASC"],
        ["start_time", "ASC"],
        ["period", "ASC"],
      ],
    });

    const result = slots.map((slot) => {
      const data = slot.toJSON();

      return {
        ...data,

        day: DAY_NAMES[data.day_of_week] || data.day_of_week,

        class: data.SchoolClass || data.class || null,

        teacher: data.Teacher || data.teacher || null,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Get my timetable error:", err);

    res.status(500).json({
      message: "Failed to fetch timetable.",
      error: err.message,
    });
  }
};

// --------------------------------------------------
// CONFLICT CHECK
// --------------------------------------------------

async function findConflict({
  class_id,
  teacher_id,
  day_of_week,
  start_time,
  end_time,
  excludeId = null,
}) {
  const existingSlots = await TimetableSlot.findAll({
    where: {
      day_of_week,
    },

    include: [
      {
        model: SchoolClass,
        attributes: ["id", "name", "section"],
      },
      {
        model: Teacher,
        attributes: ["id", "name"],
      },
    ],
  });

  for (const slot of existingSlots) {
    if (
      excludeId &&
      String(slot.id) === String(excludeId)
    ) {
      continue;
    }

    if (
      !timesOverlap(
        start_time,
        end_time,
        slot.start_time,
        slot.end_time
      )
    ) {
      continue;
    }

    // ---------------------------------------------
    // TEACHER CONFLICT
    // ---------------------------------------------

    if (
      teacher_id &&
      slot.teacher_id &&
      String(slot.teacher_id) === String(teacher_id)
    ) {
      const teacherName =
        slot.Teacher?.name || "This teacher";

      return {
        type: "teacher",
        message:
          `${teacherName} already has a class ` +
          `from ${formatTime(
            slot.start_time
          )} to ${formatTime(
            slot.end_time
          )} on ${
            DAY_NAMES[day_of_week]
          }.`,
        slot,
      };
    }

    // ---------------------------------------------
    // CLASS CONFLICT
    // ---------------------------------------------

    if (
      String(slot.class_id) === String(class_id)
    ) {
      const className = slot.SchoolClass
        ? slot.SchoolClass.section
          ? `${slot.SchoolClass.name} - ${slot.SchoolClass.section}`
          : slot.SchoolClass.name
        : "This class";

      return {
        type: "class",
        message:
          `${className} already has a class ` +
          `from ${formatTime(
            slot.start_time
          )} to ${formatTime(
            slot.end_time
          )} on ${
            DAY_NAMES[day_of_week]
          }.`,
        slot,
      };
    }
  }

  return null;
}

// --------------------------------------------------
// POST /api/timetable
// --------------------------------------------------

exports.createSlot = async (req, res) => {
  try {
    const body = req.body || {};

    const class_id = body.class_id;
    const teacher_id =
      body.teacher_id === "" ||
      body.teacher_id === undefined
        ? null
        : body.teacher_id;

    const subject =
      typeof body.subject === "string"
        ? body.subject.trim()
        : body.subject;

    const day_of_week = normalizeDay(
      body.day_of_week ?? body.day
    );

    const start_time = body.start_time;
    const end_time = body.end_time;

    const room =
      typeof body.room === "string"
        ? body.room.trim()
        : body.room || null;

    const period =
      body.period !== undefined &&
      body.period !== ""
        ? Number(body.period)
        : null;

    // ---------------------------------------------
    // VALIDATION
    // ---------------------------------------------

    if (!class_id) {
      return res.status(400).json({
        message: "Class is required.",
      });
    }

    if (!subject) {
      return res.status(400).json({
        message: "Subject is required.",
      });
    }

    if (!day_of_week) {
      return res.status(400).json({
        message: "Valid day is required.",
      });
    }

    if (!start_time || !end_time) {
      return res.status(400).json({
        message:
          "Start time and end time are required.",
      });
    }

    const startMinutes =
      timeToMinutes(start_time);

    const endMinutes =
      timeToMinutes(end_time);

    if (
      startMinutes === null ||
      endMinutes === null
    ) {
      return res.status(400).json({
        message: "Invalid start or end time.",
      });
    }

    if (endMinutes <= startMinutes) {
      return res.status(400).json({
        message:
          "End time must be after start time.",
      });
    }

    // ---------------------------------------------
    // PERIOD
    // ---------------------------------------------

    // Existing database requires period.
    // If frontend doesn't send it, calculate a
    // safe period based on start time.

    const finalPeriod =
      period ||
      Math.floor(startMinutes / 60);

    // ---------------------------------------------
    // CONFLICT CHECK
    // ---------------------------------------------

    const conflict = await findConflict({
      class_id,
      teacher_id,
      day_of_week,
      start_time,
      end_time,
    });

    if (conflict) {
      return res.status(409).json({
        message: conflict.message,
        conflict_type: conflict.type,
      });
    }

    // ---------------------------------------------
    // CREATE
    // ---------------------------------------------

    const slot = await TimetableSlot.create({
      class_id: Number(class_id),

      teacher_id:
        teacher_id === null
          ? null
          : Number(teacher_id),

      subject,

      day_of_week,

      period: finalPeriod,

      start_time,

      end_time,

      room,
    });

    await logAction(req, {
      action: "create",
      entity: "TimetableSlot",
      entityId: slot.id,
      details: {
        class_id,
        teacher_id,
        subject,
        day_of_week,
        period: finalPeriod,
        start_time,
        end_time,
        room,
      },
    });

    const createdSlot =
      await TimetableSlot.findByPk(
        slot.id,
        {
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
        }
      );

    res.status(201).json({
      ...createdSlot.toJSON(),

      day:
        DAY_NAMES[
          createdSlot.day_of_week
        ] || createdSlot.day_of_week,
    });
  } catch (err) {
    console.error(
      "Create timetable error:",
      err
    );

    // Sequelize unique constraint
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message:
          "This class already has a timetable slot for this day and period.",
        conflict_type: "class_period",
      });
    }

    res.status(500).json({
      message:
        "Failed to create timetable slot.",
      error: err.message,
    });
  }
};

// --------------------------------------------------
// PUT /api/timetable/:id
// --------------------------------------------------

exports.updateSlot = async (req, res) => {
  try {
    const slot =
      await TimetableSlot.findByPk(
        req.params.id
      );

    if (!slot) {
      return res.status(404).json({
        message: "Slot not found.",
      });
    }

    const body = req.body || {};

    const class_id =
      body.class_id ?? slot.class_id;

    const teacher_id =
      body.teacher_id === "" ||
      body.teacher_id === undefined
        ? slot.teacher_id
        : body.teacher_id;

    const subject =
      body.subject !== undefined
        ? String(body.subject).trim()
        : slot.subject;

    const day_of_week = normalizeDay(
      body.day_of_week ??
        body.day ??
        slot.day_of_week
    );

    const start_time =
      body.start_time ??
      slot.start_time;

    const end_time =
      body.end_time ??
      slot.end_time;

    const room =
      body.room !== undefined
        ? String(body.room).trim()
        : slot.room;

    const period =
      body.period !== undefined &&
      body.period !== ""
        ? Number(body.period)
        : slot.period;

    // ---------------------------------------------
    // VALIDATION
    // ---------------------------------------------

    if (!class_id) {
      return res.status(400).json({
        message: "Class is required.",
      });
    }

    if (!subject) {
      return res.status(400).json({
        message: "Subject is required.",
      });
    }

    if (!day_of_week) {
      return res.status(400).json({
        message: "Valid day is required.",
      });
    }

    const startMinutes =
      timeToMinutes(start_time);

    const endMinutes =
      timeToMinutes(end_time);

    if (
      startMinutes === null ||
      endMinutes === null
    ) {
      return res.status(400).json({
        message: "Invalid start or end time.",
      });
    }

    if (endMinutes <= startMinutes) {
      return res.status(400).json({
        message:
          "End time must be after start time.",
      });
    }

    // ---------------------------------------------
    // CONFLICT CHECK
    // ---------------------------------------------

    const conflict = await findConflict({
      class_id,
      teacher_id,
      day_of_week,
      start_time,
      end_time,
      excludeId: slot.id,
    });

    if (conflict) {
      return res.status(409).json({
        message: conflict.message,
        conflict_type: conflict.type,
      });
    }

    // ---------------------------------------------
    // UPDATE
    // ---------------------------------------------

    await slot.update({
      class_id: Number(class_id),

      teacher_id:
        teacher_id === null
          ? null
          : Number(teacher_id),

      subject,

      day_of_week,

      period,

      start_time,

      end_time,

      room,
    });

    await logAction(req, {
      action: "update",
      entity: "TimetableSlot",
      entityId: slot.id,
      details: {
        class_id,
        teacher_id,
        subject,
        day_of_week,
        period,
        start_time,
        end_time,
        room,
      },
    });

    const updatedSlot =
      await TimetableSlot.findByPk(
        slot.id,
        {
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
        }
      );

    res.json({
      ...updatedSlot.toJSON(),

      day:
        DAY_NAMES[
          updatedSlot.day_of_week
        ] || updatedSlot.day_of_week,
    });
  } catch (err) {
    console.error(
      "Update timetable error:",
      err
    );

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        message:
          "This class already has a timetable slot for this day and period.",
        conflict_type: "class_period",
      });
    }

    res.status(500).json({
      message:
        "Failed to update timetable slot.",
      error: err.message,
    });
  }
};

// --------------------------------------------------
// DELETE /api/timetable/:id
// --------------------------------------------------

exports.deleteSlot = async (req, res) => {
  try {
    const slot =
      await TimetableSlot.findByPk(
        req.params.id
      );

    if (!slot) {
      return res.status(404).json({
        message: "Slot not found.",
      });
    }

    await logAction(req, {
      action: "delete",
      entity: "TimetableSlot",
      entityId: slot.id,
    });

    await slot.destroy();

    res.json({
      message: "Slot deleted.",
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
