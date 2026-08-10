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
};

const DAY_NAME = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

const timeToMinutes = (time) => {
  if (!time) return 0;

  const [hours, minutes] = String(time)
    .slice(0, 5)
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
};

const isOverlapping = (
  startA,
  endA,
  startB,
  endB
) => {
  return (
    timeToMinutes(startA) < timeToMinutes(endB) &&
    timeToMinutes(endA) > timeToMinutes(startB)
  );
};

const getDayNumber = (day) => {
  if (typeof day === "number") return day;

  return DAY_MAP[day] || null;
};

const getDayName = (day) => {
  return DAY_NAME[day] || day;
};

// --------------------------------------------------
// CHECK CONFLICT
// --------------------------------------------------

const checkConflict = async ({
  class_id,
  teacher_id,
  day_of_week,
  start_time,
  end_time,
  excludeId = null,
}) => {
  const existingSlots = await TimetableSlot.findAll({
    where: {
      day_of_week,
    },
  });

  for (const slot of existingSlots) {
    // Current slot ko ignore karo during edit
    if (
      excludeId &&
      String(slot.id) === String(excludeId)
    ) {
      continue;
    }

    const overlap = isOverlapping(
      start_time,
      end_time,
      slot.start_time,
      slot.end_time
    );

    if (!overlap) continue;

    // ---------------------------------------------
    // TEACHER CONFLICT
    // ---------------------------------------------

    if (
      teacher_id &&
      slot.teacher_id &&
      String(slot.teacher_id) === String(teacher_id)
    ) {
      const teacher = await Teacher.findByPk(
        teacher_id,
        {
          attributes: ["id", "name"],
        }
      );

      return {
        type: "teacher",
        message: `Teacher ${
          teacher?.name || "selected teacher"
        } already has a class from ${
          slot.start_time
        } to ${
          slot.end_time
        } on ${getDayName(day_of_week)}.`,
      };
    }

    // ---------------------------------------------
    // CLASS CONFLICT
    // ---------------------------------------------

    if (
      String(slot.class_id) === String(class_id)
    ) {
      return {
        type: "class",
        message: `This class already has a class from ${
          slot.start_time
        } to ${
          slot.end_time
        } on ${getDayName(day_of_week)}.`,
      };
    }

    // ---------------------------------------------
    // ROOM CONFLICT
    // ---------------------------------------------

    if (
      slot.room &&
      slot.room.trim() &&
      slot.room.trim().toLowerCase() ===
        String(arguments[0]?.room || "")
          .trim()
          .toLowerCase()
    ) {
      return {
        type: "room",
        message: `Room ${
          slot.room
        } is already occupied from ${
          slot.start_time
        } to ${
          slot.end_time
        } on ${getDayName(day_of_week)}.`,
      };
    }
  }

  return null;
};

// --------------------------------------------------
// GET TIMETABLE
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
        ["day_of_week", "ASC"],
        ["start_time", "ASC"],
        ["period", "ASC"],
      ],
    });

    // Frontend-friendly response
    const formattedSlots = slots.map(
      (slot) => {
        const data = slot.toJSON();

        return {
          ...data,

          day:
            getDayName(
              data.day_of_week
            ),

          class_id:
            data.class_id,

          teacher_id:
            data.teacher_id,
        };
      }
    );

    res.json(formattedSlots);
  } catch (err) {
    console.error(
      "GET TIMETABLE ERROR:",
      err
    );

    res.status(500).json({
      message:
        "Failed to fetch timetable.",
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

      where = {
        class_id:
          student.class_id,
      };
    }

    if (req.user.role === "teacher") {
      const teacher =
        await Teacher.findOne({
          where: {
            user_id: req.user.id,
          },
        });

      if (!teacher) {
        return res.json([]);
      }

      where = {
        teacher_id:
          teacher.id,
      };
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
          ["day_of_week", "ASC"],
          ["start_time", "ASC"],
          ["period", "ASC"],
        ],
      });

    const formattedSlots =
      slots.map((slot) => {
        const data =
          slot.toJSON();

        return {
          ...data,

          day:
            getDayName(
              data.day_of_week
            ),
        };
      });

    res.json(formattedSlots);
  } catch (err) {
    console.error(
      "GET MY TIMETABLE ERROR:",
      err
    );

    res.status(500).json({
      message:
        "Failed to fetch timetable.",
      error: err.message,
    });
  }
};

// --------------------------------------------------
// CREATE SLOT
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
      day_of_week,
      period,
      start_time,
      end_time,
      room,
    } = req.body;

    // ---------------------------------------------
    // BASIC VALIDATION
    // ---------------------------------------------

    if (!class_id) {
      return res.status(400).json({
        message:
          "Class is required.",
      });
    }

    if (!subject) {
      return res.status(400).json({
        message:
          "Subject is required.",
      });
    }

    if (!start_time || !end_time) {
      return res.status(400).json({
        message:
          "Start time and end time are required.",
      });
    }

    // ---------------------------------------------
    // DAY
    // ---------------------------------------------

    const selectedDay =
      getDayNumber(
        day || day_of_week
      );

    if (!selectedDay) {
      return res.status(400).json({
        message:
          "Valid day is required.",
      });
    }

    // ---------------------------------------------
    // TIME
    // ---------------------------------------------

    if (
      timeToMinutes(end_time) <=
      timeToMinutes(start_time)
    ) {
      return res.status(400).json({
        message:
          "End time must be after start time.",
      });
    }

    // ---------------------------------------------
    // PERIOD
    // ---------------------------------------------

    const selectedPeriod =
      period ||
      Math.floor(
        timeToMinutes(start_time) /
          60
      ) + 1;

    // ---------------------------------------------
    // CONFLICT CHECK
    // ---------------------------------------------

    const conflict =
      await checkConflict({
        class_id,
        teacher_id,
        day_of_week:
          selectedDay,
        start_time,
        end_time,
      });

    if (conflict) {
      return res.status(409).json(
        conflict
      );
    }

    // ---------------------------------------------
    // CREATE
    // ---------------------------------------------

    const payload = {
      class_id:
        Number(class_id),

      teacher_id:
        teacher_id
          ? Number(teacher_id)
          : null,

      subject:
        String(subject).trim(),

      day_of_week:
        selectedDay,

      period:
        Number(selectedPeriod),

      start_time,
      end_time,

      room:
        room
          ? String(room).trim()
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

    res.status(201).json(
      slot
    );
  } catch (err) {
    console.error(
      "CREATE TIMETABLE ERROR:",
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
// UPDATE SLOT
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
          "Slot not found.",
      });
    }

    const {
      class_id,
      teacher_id,
      subject,
      day,
      day_of_week,
      period,
      start_time,
      end_time,
      room,
    } = req.body;

    const selectedDay =
      getDayNumber(
        day ||
          day_of_week ||
          slot.day_of_week
      );

    const newStart =
      start_time ||
      slot.start_time;

    const newEnd =
      end_time ||
      slot.end_time;

    const newClassId =
      class_id ||
      slot.class_id;

    const newTeacherId =
      teacher_id === ""
        ? null
        : teacher_id ??
          slot.teacher_id;

    if (
      timeToMinutes(newEnd) <=
      timeToMinutes(newStart)
    ) {
      return res.status(400).json({
        message:
          "End time must be after start time.",
      });
    }

    // ---------------------------------------------
    // CONFLICT CHECK
    // ---------------------------------------------

    const conflict =
      await checkConflict({
        class_id:
          newClassId,

        teacher_id:
          newTeacherId,

        day_of_week:
          selectedDay,

        start_time:
          newStart,

        end_time:
          newEnd,

        excludeId:
          slot.id,
      });

    if (conflict) {
      return res.status(409).json(
        conflict
      );
    }

    // ---------------------------------------------
    // UPDATE
    // ---------------------------------------------

    const payload = {
      class_id:
        Number(newClassId),

      teacher_id:
        newTeacherId
          ? Number(newTeacherId)
          : null,

      subject:
        subject !== undefined
          ? String(subject).trim()
          : slot.subject,

      day_of_week:
        selectedDay,

      period:
        period ||
        slot.period,

      start_time:
        newStart,

      end_time:
        newEnd,

      room:
        room !== undefined
          ? String(room).trim()
          : slot.room,
    };

    await slot.update(
      payload
    );

    await logAction(req, {
      action: "update",
      entity: "TimetableSlot",
      entityId: slot.id,
      details: payload,
    });

    res.json(slot);
  } catch (err) {
    console.error(
      "UPDATE TIMETABLE ERROR:",
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
// DELETE SLOT
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
          "Slot not found.",
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
        "Slot deleted successfully.",
    });
  } catch (err) {
    console.error(
      "DELETE TIMETABLE ERROR:",
      err
    );

    res.status(500).json({
      message:
        "Failed to delete timetable slot.",
      error: err.message,
    });
  }
};
