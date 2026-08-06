const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Named SchoolClass to avoid clashing with the JS `class` keyword
const SchoolClass = sequelize.define("SchoolClass", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING, // e.g. "10th"
    allowNull: false,
  },
  section: {
    type: DataTypes.STRING, // e.g. "A"
    allowNull: false,
    defaultValue: "A",
  },
  teacher_id: {
    // Class teacher (references Teacher.id), nullable
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: "classes",
});

module.exports = SchoolClass;
