const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const LeaveRequest = sequelize.define("LeaveRequest", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  applicant_user_id: { type: DataTypes.INTEGER, allowNull: false },
  applicant_name: { type: DataTypes.STRING, allowNull: false },
  applicant_role: { type: DataTypes.STRING, allowNull: false },
  from_date: { type: DataTypes.DATEONLY, allowNull: false },
  to_date: { type: DataTypes.DATEONLY, allowNull: false },
  reason: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM("pending", "approved", "rejected"), defaultValue: "pending" },
  reviewed_by: { type: DataTypes.INTEGER, allowNull: true },
  review_note: { type: DataTypes.STRING },
}, { tableName: "leave_requests" });

module.exports = LeaveRequest;
