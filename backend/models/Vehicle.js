const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Vehicle = sequelize.define("Vehicle", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicle_number: { type: DataTypes.STRING, allowNull: false },
  driver_name: { type: DataTypes.STRING },
  driver_phone: { type: DataTypes.STRING },
  capacity: { type: DataTypes.INTEGER, defaultValue: 40 },
}, { tableName: "vehicles" });

module.exports = Vehicle;
