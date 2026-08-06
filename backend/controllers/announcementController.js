const { Announcement } = require("../models");
const { logAction } = require("../utils/audit");
const { Op } = require("sequelize");

// GET /api/announcements - visible to the logged-in user's role (or "all")
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.findAll({
      where: { target_role: { [Op.in]: ["all", req.user.role] } },
      order: [["created_at", "DESC"]],
      limit: 50,
    });
    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch announcements.", error: err.message });
  }
};

// POST /api/announcements (admin, management)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, message, target_role, priority } = req.body;
    const announcement = await Announcement.create({
      title, message, target_role: target_role || "all", priority: priority || "normal",
      created_by: req.user.id,
    });
    await logAction(req, { action: "create", entity: "Announcement", entityId: announcement.id, details: { title } });
    res.status(201).json(announcement);
  } catch (err) {
    res.status(500).json({ message: "Failed to create announcement.", error: err.message });
  }
};

// DELETE /api/announcements/:id (admin, management)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found." });
    await logAction(req, { action: "delete", entity: "Announcement", entityId: announcement.id, details: { title: announcement.title } });
    await announcement.destroy();
    res.json({ message: "Announcement deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete announcement.", error: err.message });
  }
};
