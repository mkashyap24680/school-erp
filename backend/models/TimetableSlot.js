const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TimetableSlot = sequelize.define("TimetableSlot", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  class_id: { type: DataTypes.INTEGER, allowNull: false },
  teacher_id: { type: DataTypes.INTEGER, allowNull: true },
  subject: { type: DataTypes.STRING, allowNull: false },
  day_of_week: {
    // 1 = Monday ... 7 = Sunday
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 7 },
  },
  period: { type: DataTypes.INTEGER, allowNull: false }, // period number e.g. 1..8
  start_time: { type: DataTypes.STRING }, // "09:00"
  end_time: { type: DataTypes.STRING },   // "09:45"
  room: { type: DataTypes.STRING },
}, {
  tableName: "timetable_slots",
  indexes: [{ unique: true, fields: ["class_id", "day_of_week", "period"] }],
});

module.exports = TimetableSlot;
