const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Teacher = sequelize.define("Teacher", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // linked login account
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employee_id: {
    type: DataTypes.STRING,
  },
  email: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING,
  },
  subject: {
    type: DataTypes.STRING,
  },
  department: {
    type: DataTypes.STRING,
  },
  course: {
    type: DataTypes.STRING,
  },
  designation: {
    type: DataTypes.STRING,
  },
  qualification: {
    type: DataTypes.STRING,
  },
  joining_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  experience: {
    type: DataTypes.STRING,
  },
  employment_type: {
    type: DataTypes.STRING,
  },
  campus: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: "active",
  },
  address: {
    type: DataTypes.TEXT,
  },
  emergency_contact_name: {
    type: DataTypes.STRING,
  },
  emergency_contact_number: {
    type: DataTypes.STRING,
  },
}, {
  tableName: "teachers",
});

module.exports = Teacher;
