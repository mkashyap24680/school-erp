const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TransportRoute = sequelize.define("TransportRoute", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false }, // e.g. "Route 1 - North Zone"
  stops: { type: DataTypes.TEXT }, // comma separated stop names
  vehicle_id: { type: DataTypes.INTEGER, allowNull: true },
  monthly_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
}, { tableName: "transport_routes" });

module.exports = TransportRoute;
