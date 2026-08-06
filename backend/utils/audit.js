const { AuditLog } = require("../models");

/**
 * Records an audit trail entry. Never throws — logging failures should not
 * break the actual request.
 */
async function logAction(req, { action, entity, entityId, details }) {
  try {
    await AuditLog.create({
      user_id: req.user?.id || null,
      user_name: req.user?.name || "System",
      user_role: req.user?.role || "unknown",
      action,
      entity,
      entity_id: entityId || null,
      details: details ? JSON.stringify(details).slice(0, 2000) : null,
    });
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
}

module.exports = { logAction };
