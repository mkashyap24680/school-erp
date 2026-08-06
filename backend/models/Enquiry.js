const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Enquiry = sequelize.define("Enquiry", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING, allowNull: false },
  class_applying: { type: DataTypes.STRING },
  message: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM("new", "contacted", "converted", "rejected"),
    defaultValue: "new",
  },
  notes: { type: DataTypes.TEXT },
}, { tableName: "enquiries" });

module.exports = Enquiry;
