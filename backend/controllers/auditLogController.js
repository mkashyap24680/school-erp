const { AuditLog } = require("../models");

// GET /api/audit-logs (admin only)
exports.getLogs = async (req, res) => {
  try {
    const { entity, action, limit = 100 } = req.query;
    const where = {};
    if (entity) where.entity = entity;
    if (action) where.action = action;

    const logs = await AuditLog.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit: Math.min(Number(limit) || 100, 500),
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch audit logs.", error: err.message });
  }
};
