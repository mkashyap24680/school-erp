const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Event = sequelize.define("Event", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  type: { type: DataTypes.ENUM("holiday", "event", "exam", "meeting"), defaultValue: "event" },
}, { tableName: "events" });

module.exports = Event;
