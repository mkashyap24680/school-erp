const { Event } = require("../models");

// GET /api/events?month=&year=
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.findAll({ order: [["date", "ASC"]] });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events.", error: err.message });
  }
};

// POST /api/events (admin, management)
exports.createEvent = async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: "Failed to create event.", error: err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });
    await event.destroy();
    res.json({ message: "Event deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete event.", error: err.message });
  }
};
