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
      allowNull: false,
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    day: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [
          [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
        ],
      },
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
    timestamps: true,
    underscored: true,
  }
);

module.exports = TimetableSlot;
