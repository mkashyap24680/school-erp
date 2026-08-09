const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const SchoolClass = sequelize.define(
  "SchoolClass",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Course, e.g. B.Tech, BCA, MCA
    course_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Course code, e.g. BT, BCA
    course_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Department, e.g. Computer Science & Engineering
    department_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // Department code, e.g. CSE
    department_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    // Section is OPTIONAL
    // e.g. A, B, C
    section: {
      type: DataTypes.STRING,
      allowNull: true,
    },

   // Year, manually entered, e.g. 1st Year, 2nd Year
year: {
  type: DataTypes.STRING,
  allowNull: true,
},

semester: {
  type: DataTypes.STRING,
  allowNull: true,
},

session: {
  type: DataTypes.STRING,
  allowNull: true,
},

section: {
  type: DataTypes.STRING,
  allowNull: true,
},
    // Class teacher
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  },
  {
    tableName: "classes",
  }
);

module.exports = SchoolClass;
