const { Fee, Payment, Student } = require("../models");
const { logAction } = require("../utils/audit");

/**
 * DEMO PAYMENT GATEWAY
 * ---------------------------------------------------------------
 * This simulates the order-create + confirm flow used by real gateways
 * like Razorpay/Stripe, so the frontend checkout UI and backend wiring
 * are already in place. To go live:
 *   1. In createOrder(): call the real gateway's "create order" API
 *      instead of generating a local mock order id.
 *   2. In confirmPayment(): verify the gateway's signature/webhook
 *      instead of trusting the client-supplied payment id.
 * Until then, "payments" here are recorded for bookkeeping but do not
 * move real money.
 */

// POST /api/payments/order - student creates a payment order for a fee
exports.createOrder = async (req, res) => {
  try {
    const { fee_id } = req.body;
    const fee = await Fee.findByPk(fee_id);
    if (!fee) return res.status(404).json({ message: "Fee record not found." });

    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student || student.id !== fee.student_id) {
      return res.status(403).json({ message: "This fee record does not belong to you." });
    }

    const outstanding = Number(fee.amount) - Number(fee.paid_amount);
    if (outstanding <= 0) return res.status(400).json({ message: "This fee is already fully paid." });

    const orderId = `demo_order_${Date.now()}_${fee.id}`;
    const payment = await Payment.create({
      fee_id: fee.id,
      amount: outstanding,
      provider: "demo",
      provider_order_id: orderId,
      status: "created",
    });

    res.status(201).json({ orderId, amount: outstanding, paymentId: payment.id });
  } catch (err) {
    res.status(500).json({ message: "Failed to create payment order.", error: err.message });
  }
};

// POST /api/payments/confirm - "gateway" confirms payment succeeded
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentId } = req.body;
    const payment = await Payment.findByPk(paymentId);
    if (!payment) return res.status(404).json({ message: "Payment not found." });

    payment.status = "success";
    payment.provider_payment_id = `demo_pay_${Date.now()}`;
    await payment.save();

    const fee = await Fee.findByPk(payment.fee_id);
    if (fee) {
      const newPaid = Number(fee.paid_amount) + Number(payment.amount);
      fee.paid_amount = newPaid;
      fee.status = newPaid >= Number(fee.amount) ? "paid" : "partial";
      fee.payment_date = new Date().toISOString().slice(0, 10);
      await fee.save();
    }

    await logAction(req, { action: "payment", entity: "Fee", entityId: fee?.id, details: { amount: payment.amount } });
    res.json({ message: "Payment successful.", payment, fee });
  } catch (err) {
    res.status(500).json({ message: "Failed to confirm payment.", error: err.message });
  }
};

// GET /api/payments/me - student's payment history
exports.getMyPayments = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    const fees = await Fee.findAll({ where: { student_id: student.id }, attributes: ["id"] });
    const feeIds = fees.map((f) => f.id);

    const payments = await Payment.findAll({
      where: { fee_id: feeIds },
      include: [{ model: Fee, attributes: ["title"] }],
      order: [["created_at", "DESC"]],
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payments.", error: err.message });
  }
};
