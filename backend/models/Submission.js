const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Submission = sequelize.define("Submission", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  assignment_id: { type: DataTypes.INTEGER, allowNull: false },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  content: { type: DataTypes.TEXT }, // text answer / notes (no file upload in this MVP)
  submitted_at: { type: DataTypes.DATE },
  grade: { type: DataTypes.STRING }, // e.g. "A", "18/20"
  feedback: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM("pending", "submitted", "graded"), defaultValue: "pending" },
}, {
  tableName: "submissions",
  indexes: [{ unique: true, fields: ["assignment_id", "student_id"] }],
});

module.exports = Submission;
