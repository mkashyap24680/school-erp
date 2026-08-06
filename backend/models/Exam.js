const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Exam = sequelize.define("Exam", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING, // e.g. "Mid Term Exam"
    allowNull: false,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  exam_date: {
    type: DataTypes.DATEONLY,
  },
  total_marks: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
}, {
  tableName: "exams",
});

module.exports = Exam;
