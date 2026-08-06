const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Payroll = sequelize.define("Payroll", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  teacher_id: { type: DataTypes.INTEGER, allowNull: false },
  month: { type: DataTypes.INTEGER, allowNull: false }, // 1-12
  year: { type: DataTypes.INTEGER, allowNull: false },
  basic_salary: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  allowances: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  deductions: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  net_salary: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM("pending", "paid"), defaultValue: "pending" },
  paid_date: { type: DataTypes.DATEONLY, allowNull: true },
}, {
  tableName: "payrolls",
  indexes: [{ unique: true, fields: ["teacher_id", "month", "year"] }],
});

module.exports = Payroll;
