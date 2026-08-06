const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Room = sequelize.define("Room", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  hostel_id: { type: DataTypes.INTEGER, allowNull: false },
  room_no: { type: DataTypes.STRING, allowNull: false },
  capacity: { type: DataTypes.INTEGER, defaultValue: 2 },
}, {
  tableName: "rooms",
  indexes: [{ unique: true, fields: ["hostel_id", "room_no"] }],
});

module.exports = Room;
