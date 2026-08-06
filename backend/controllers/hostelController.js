const { Hostel, Room, Student } = require("../models");
const { logAction } = require("../utils/audit");

// ---- Hostels ----
exports.getAllHostels = async (req, res) => {
  try {
    const hostels = await Hostel.findAll({
      include: [{ model: Room, include: [{ model: Student, attributes: ["id", "name"] }] }],
      order: [["name", "ASC"]],
    });
    const withCounts = hostels.map((h) => {
      const json = h.toJSON();
      const totalCapacity = json.Rooms.reduce((sum, r) => sum + r.capacity, 0);
      const occupied = json.Rooms.reduce((sum, r) => sum + (r.Students?.length || 0), 0);
      return { ...json, totalCapacity, occupied, roomCount: json.Rooms.length };
    });
    res.json(withCounts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch hostels.", error: err.message });
  }
};

exports.createHostel = async (req, res) => {
  try {
    const hostel = await Hostel.create(req.body);
    await logAction(req, { action: "create", entity: "Hostel", entityId: hostel.id, details: { name: hostel.name } });
    res.status(201).json(hostel);
  } catch (err) {
    res.status(500).json({ message: "Failed to create hostel.", error: err.message });
  }
};

exports.deleteHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findByPk(req.params.id);
    if (!hostel) return res.status(404).json({ message: "Hostel not found." });
    await hostel.destroy();
    res.json({ message: "Hostel deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete hostel.", error: err.message });
  }
};

// ---- Rooms ----
exports.createRoom = async (req, res) => {
  try {
    const room = await Room.create(req.body);
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: "Failed to create room.", error: err.message });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found." });
    await room.destroy();
    res.json({ message: "Room deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete room.", error: err.message });
  }
};

// Allot a student to a room (or vacate with room_id: null)
exports.allotStudent = async (req, res) => {
  try {
    const { student_id, room_id } = req.body;
    const student = await Student.findByPk(student_id);
    if (!student) return res.status(404).json({ message: "Student not found." });

    if (room_id) {
      const room = await Room.findByPk(room_id);
      if (!room) return res.status(404).json({ message: "Room not found." });
      const occupantCount = await Student.count({ where: { hostel_room_id: room_id } });
      if (occupantCount >= room.capacity) {
        return res.status(400).json({ message: "This room is already at full capacity." });
      }
    }

    student.hostel_room_id = room_id || null;
    await student.save();
    await logAction(req, { action: "update", entity: "HostelAllotment", entityId: student.id, details: { room_id } });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: "Failed to allot room.", error: err.message });
  }
};
