const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Question = sequelize.define("Question", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  quiz_id: { type: DataTypes.INTEGER, allowNull: false },
  question_text: { type: DataTypes.TEXT, allowNull: false },
  option_a: { type: DataTypes.STRING, allowNull: false },
  option_b: { type: DataTypes.STRING, allowNull: false },
  option_c: { type: DataTypes.STRING, allowNull: false },
  option_d: { type: DataTypes.STRING, allowNull: false },
  correct_option: { type: DataTypes.ENUM("a", "b", "c", "d"), allowNull: false },
  marks: { type: DataTypes.INTEGER, defaultValue: 1 },
}, { tableName: "questions" });

module.exports = Question;
