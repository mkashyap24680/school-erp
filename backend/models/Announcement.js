const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Announcement = sequelize.define("Announcement", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  // Which roles this announcement targets. "all" = everyone.
  target_role: {
    type: DataTypes.ENUM("all", "admin", "management", "teacher", "student", "parent"),
    allowNull: false,
    defaultValue: "all",
  },
  priority: {
    type: DataTypes.ENUM("normal", "important", "urgent"),
    defaultValue: "normal",
  },
  created_by: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: "announcements" });

module.exports = Announcement;
