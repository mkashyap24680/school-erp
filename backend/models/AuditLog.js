const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const AuditLog = sequelize.define("AuditLog", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  user_name: { type: DataTypes.STRING },
  user_role: { type: DataTypes.STRING },
  action: { type: DataTypes.STRING, allowNull: false },   // e.g. "create", "update", "delete", "login"
  entity: { type: DataTypes.STRING, allowNull: false },   // e.g. "Student", "Fee", "User"
  entity_id: { type: DataTypes.INTEGER, allowNull: true },
  details: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: "audit_logs" });

module.exports = AuditLog;
