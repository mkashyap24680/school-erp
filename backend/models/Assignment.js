const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Assignment = sequelize.define("Assignment", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  class_id: { type: DataTypes.INTEGER, allowNull: false },
  teacher_id: { type: DataTypes.INTEGER, allowNull: true },
  subject: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  due_date: { type: DataTypes.DATEONLY },
}, { tableName: "assignments" });

module.exports = Assignment;
