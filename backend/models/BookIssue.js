const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const BookIssue = sequelize.define("BookIssue", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  book_id: { type: DataTypes.INTEGER, allowNull: false },
  student_id: { type: DataTypes.INTEGER, allowNull: false },
  issue_date: { type: DataTypes.DATEONLY, allowNull: false },
  due_date: { type: DataTypes.DATEONLY, allowNull: false },
  return_date: { type: DataTypes.DATEONLY, allowNull: true },
  status: {
    type: DataTypes.ENUM("issued", "returned", "overdue"),
    defaultValue: "issued",
  },
}, { tableName: "book_issues" });

module.exports = BookIssue;
