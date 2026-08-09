const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const StudentAcademicHistory = sequelize.define(
  "StudentAcademicHistory",
  {
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

    session: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    year: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    semester: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    section: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("active", "completed"),
      defaultValue: "active",
    },
  },
  {
    tableName: "student_academic_history",
  }
);

module.exports = StudentAcademicHistory;
