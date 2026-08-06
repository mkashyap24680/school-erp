const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Single-row table holding school branding info.
const SchoolProfile = sequelize.define("SchoolProfile", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  school_name: { type: DataTypes.STRING, defaultValue: "Your School Name" },
  tagline: { type: DataTypes.STRING, defaultValue: "" },
  logo_base64: { type: DataTypes.TEXT("long"), allowNull: true },
  primary_color: { type: DataTypes.STRING, defaultValue: "#2f9e44" },
}, { tableName: "school_profile" });

module.exports = SchoolProfile;
