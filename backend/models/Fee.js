const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Fee = sequelize.define("Fee", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING, // e.g. "Term 1 Fee", "Transport Fee"
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paid_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  due_date: {
    type: DataTypes.DATEONLY,
  },
  payment_date: {
    type: DataTypes.DATEONLY,
  },
  status: {
    type: DataTypes.ENUM("paid", "unpaid", "partial"),
    defaultValue: "unpaid",
  },
}, {
  tableName: "fees",
});

module.exports = Fee;
