const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Student = sequelize.define("Student", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // linked login account
  },
  guardian_user_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // linked parent/guardian login account (Parent Portal)
  },
  route_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Transport route assignment
  },
  hostel_room_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Hostel room assignment
  },
  class_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
  },
  roll_no: {
    type: DataTypes.STRING,
  },
  admission_no: {
    type: DataTypes.STRING,
    unique: true,
  },
  dob: {
    type: DataTypes.DATEONLY,
  },
  gender: {
    type: DataTypes.ENUM("male", "female", "other"),
  },
  parent_name: {
    type: DataTypes.STRING,
  },
  parent_phone: {
    type: DataTypes.STRING,
  },
  address: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: "students",
});

module.exports = Student;
