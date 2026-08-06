const { Payroll, Teacher } = require("../models");
const { logAction } = require("../utils/audit");

// GET /api/payroll (admin only)
exports.getAllPayroll = async (req, res) => {
  try {
    const records = await Payroll.findAll({
      include: [{ model: Teacher, attributes: ["id", "name", "subject"] }],
      order: [["year", "DESC"], ["month", "DESC"]],
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch payroll.", error: err.message });
  }
};

// POST /api/payroll (admin only)
exports.createPayroll = async (req, res) => {
  try {
    const { teacher_id, month, year, basic_salary, allowances = 0, deductions = 0 } = req.body;
    const net_salary = Number(basic_salary) + Number(allowances) - Number(deductions);
    const record = await Payroll.create({ teacher_id, month, year, basic_salary, allowances, deductions, net_salary });
    await logAction(req, { action: "create", entity: "Payroll", entityId: record.id, details: { teacher_id, month, year } });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: "Failed to create payroll record.", error: err.message });
  }
};

// PUT /api/payroll/:id (admin only) - e.g. mark as paid
exports.updatePayroll = async (req, res) => {
  try {
    const record = await Payroll.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: "Payroll record not found." });

    const basic = req.body.basic_salary ?? record.basic_salary;
    const allowances = req.body.allowances ?? record.allowances;
    const deductions = req.body.deductions ?? record.deductions;

    await record.update({
      ...req.body,
      net_salary: Number(basic) + Number(allowances) - Number(deductions),
      paid_date: req.body.status === "paid" ? new Date().toISOString().slice(0, 10) : record.paid_date,
    });
    await logAction(req, { action: "update", entity: "Payroll", entityId: record.id, details: req.body });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: "Failed to update payroll record.", error: err.message });
  }
};

exports.deletePayroll = async (req, res) => {
  try {
    const record = await Payroll.findByPk(req.params.id);
    if (!record) return res.status(404).json({ message: "Payroll record not found." });
    await record.destroy();
    res.json({ message: "Payroll record deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete payroll record.", error: err.message });
  }
};
