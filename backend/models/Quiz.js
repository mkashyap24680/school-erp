const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Quiz = sequelize.define("Quiz", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  class_id: { type: DataTypes.INTEGER, allowNull: false },
  subject: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  duration_minutes: { type: DataTypes.INTEGER, defaultValue: 10 },
  created_by: { type: DataTypes.INTEGER },
  is_published: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: "quizzes" });

module.exports = Quiz;
