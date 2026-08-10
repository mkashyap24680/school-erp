const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TimetableSlot = sequelize.define(
  "TimetableSlot",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    class_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 6,
      },
    },

    period: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    start_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    end_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    room: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "timetable_slots",

    indexes: [
      {
        unique: true,
        fields: ["class_id", "day_of_week", "period"],
      },
    ],
  }
);

module.exports = TimetableSlot;
