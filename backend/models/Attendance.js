const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Attendance = sequelize.define("Attendance", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM("present", "absent", "leave"),
    allowNull: false,
    defaultValue: "present",
  },
  marked_by: {
    type: DataTypes.INTEGER, // user id of teacher/admin who marked it
  },
}, {
  tableName: "attendance",
  indexes: [{ unique: true, fields: ["student_id", "date"] }],
});

module.exports = Attendance;
