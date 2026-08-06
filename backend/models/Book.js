const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Book = sequelize.define("Book", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  author: { type: DataTypes.STRING },
  isbn: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING },
  total_copies: { type: DataTypes.INTEGER, defaultValue: 1 },
  available_copies: { type: DataTypes.INTEGER, defaultValue: 1 },
}, { tableName: "books" });

module.exports = Book;
