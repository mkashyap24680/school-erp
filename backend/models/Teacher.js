const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Teacher = sequelize.define(
  "Teacher",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      // linked login account
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    employee_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    emergency_contact_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    emergency_contact_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    subject: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    department: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    qualification: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    designation: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    joining_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    experience: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    employment_type: {
      type: DataTypes.ENUM("Permanent", "Contract", "Part-time", "Guest"),
      allowNull: true,
      defaultValue: "Permanent",
    },

    campus: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("Active", "Inactive"),
      allowNull: false,
      defaultValue: "Active",
    },
  },
  {
    tableName: "teachers",
  }
);

module.exports = Teacher;
