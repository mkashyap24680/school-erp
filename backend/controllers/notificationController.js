const { Notification } = require("../models");

// GET /api/notifications/me
exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { user_id: req.user.id },
      order: [["created_at", "DESC"]],
      limit: 50,
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications.", error: err.message });
  }
};

// PUT /api/notifications/:id/read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!notification) return res.status(404).json({ message: "Notification not found." });
    notification.is_read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: "Failed to update notification.", error: err.message });
  }
};

// PUT /api/notifications/read-all
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update({ is_read: true }, { where: { user_id: req.user.id, is_read: false } });
    res.json({ message: "All notifications marked as read." });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notifications.", error: err.message });
  }
};
