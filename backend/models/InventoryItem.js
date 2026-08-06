const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const InventoryItem = sequelize.define("InventoryItem", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
  unit: { type: DataTypes.STRING, defaultValue: "pcs" },
  location: { type: DataTypes.STRING },
  condition: { type: DataTypes.ENUM("new", "good", "fair", "damaged"), defaultValue: "good" },
  purchase_date: { type: DataTypes.DATEONLY },
}, { tableName: "inventory_items" });

module.exports = InventoryItem;
