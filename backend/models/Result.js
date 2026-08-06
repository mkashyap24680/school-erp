const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Result = sequelize.define("Result", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  exam_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  marks_obtained: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  remarks: {
    type: DataTypes.STRING,
  },
}, {
  tableName: "results",
  indexes: [{ unique: true, fields: ["exam_id", "student_id"] }],
});

module.exports = Result;
