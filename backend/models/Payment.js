const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

// Records payment attempts against a Fee record. Works with the built-in
// demo/mock gateway out of the box; swap in real Razorpay/Stripe order +
// webhook verification later without changing this schema.
const Payment = sequelize.define("Payment", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fee_id: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  provider: { type: DataTypes.STRING, defaultValue: "demo" }, // "demo" | "razorpay" | "stripe"
  provider_order_id: { type: DataTypes.STRING },
  provider_payment_id: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM("created", "success", "failed"), defaultValue: "created" },
}, { tableName: "payments" });

module.exports = Payment;
