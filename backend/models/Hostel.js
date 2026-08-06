const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Hostel = sequelize.define("Hostel", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM("boys", "girls", "mixed"), defaultValue: "mixed" },
  warden_name: { type: DataTypes.STRING },
  warden_phone: { type: DataTypes.STRING },
}, { tableName: "hostels" });

module.exports = Hostel;
