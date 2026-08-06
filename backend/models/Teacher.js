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
  email: {
    type: DataTypes.STRING,
  },
  phone: {
    type: DataTypes.STRING,
  },
  subject: {
    type: DataTypes.STRING,
  },
  qualification: {
    type: DataTypes.STRING,
  },
  joining_date: {
    type: DataTypes.DATEONLY,
  },
}, {
  tableName: "teachers",
});

module.exports = Teacher;
