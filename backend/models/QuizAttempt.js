const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const QuizAttempt = sequelize.define("QuizAttempt", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quiz_id: { type: DataTypes.INTEGER, allowNull: false },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  answers: { type: DataTypes.TEXT }, // JSON string: { questionId: "a" }
  score: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_marks: { type: DataTypes.INTEGER, defaultValue: 0 },
  submitted_at: { type: DataTypes.DATE },
}, {
  tableName: "quiz_attempts",
  indexes: [{ unique: true, fields: ["quiz_id", "student_id"] }],
});

module.exports = QuizAttempt;
