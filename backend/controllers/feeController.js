const { Fee, Student } = require("../models");
const { logAction } = require("../utils/audit");
const { notifyUser } = require("../utils/notify");

function computeStatus(amount, paidAmount) {
  if (paidAmount <= 0) return "unpaid";
  if (paidAmount >= amount) return "paid";
  return "partial";
}

// GET /api/fees
exports.getAllFees = async (req, res) => {
  try {
    const fees = await Fee.findAll({
      include: [{ model: Student, attributes: ["id", "name", "roll_no"] }],
      order: [["due_date", "ASC"]],
    });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch fees.", error: err.message });
  }
};

// GET /api/fees/me (student's own fee records)
exports.getMyFees = async (req, res) => {
  try {
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) return res.status(404).json({ message: "Student profile not found." });

    const fees = await Fee.findAll({
      where: { student_id: student.id },
      order: [["due_date", "ASC"]],
    });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch fees.", error: err.message });
  }
};

// POST /api/fees  (admin, management)
exports.createFee = async (req, res) => {
  try {
    const { student_id, title, amount, paid_amount = 0, due_date } = req.body;
    const fee = await Fee.create({
      student_id,
      title,
      amount,
      paid_amount,
      due_date,
      status: computeStatus(amount, paid_amount),
      payment_date: paid_amount > 0 ? new Date().toISOString().slice(0, 10) : null,
    });
    await logAction(req, { action: "create", entity: "Fee", entityId: fee.id, details: { student_id, title, amount } });

    const student = await Student.findByPk(student_id);
    if (student?.user_id) {
      await notifyUser(student.user_id, {
        title: "New Fee Due",
        message: `${title}: ₹${amount} due on ${due_date || "N/A"}.`,
        type: "fee",
      });
    }

    res.status(201).json(fee);
  } catch (err) {
    res.status(500).json({ message: "Failed to create fee record.", error: err.message });
  }
};

// PUT /api/fees/:id  (admin, management) - e.g. record a payment
exports.updateFee = async (req, res) => {
  try {
    const fee = await Fee.findByPk(req.params.id);
    if (!fee) return res.status(404).json({ message: "Fee record not found." });

    const amount = req.body.amount ?? fee.amount;
    const paidAmount = req.body.paid_amount ?? fee.paid_amount;

    await fee.update({
      ...req.body,
      status: computeStatus(amount, paidAmount),
      payment_date:
        paidAmount > fee.paid_amount ? new Date().toISOString().slice(0, 10) : fee.payment_date,
    });
    await logAction(req, { action: "update", entity: "Fee", entityId: fee.id, details: req.body });
    res.json(fee);
  } catch (err) {
    res.status(500).json({ message: "Failed to update fee record.", error: err.message });
  }
};

// DELETE /api/fees/:id (admin only)
exports.deleteFee = async (req, res) => {
  try {
    const fee = await Fee.findByPk(req.params.id);
    if (!fee) return res.status(404).json({ message: "Fee record not found." });
    await logAction(req, { action: "delete", entity: "Fee", entityId: fee.id, details: { title: fee.title } });
    await fee.destroy();
    res.json({ message: "Fee record deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete fee record.", error: err.message });
  }
};
