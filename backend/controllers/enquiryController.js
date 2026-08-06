const { Enquiry } = require("../models");
const { logAction } = require("../utils/audit");

// POST /api/enquiries - PUBLIC (no auth) - prospective student/parent submits enquiry
exports.submitEnquiry = async (req, res) => {
  try {
    const { name, email, phone, class_applying, message } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required." });
    }
    const enquiry = await Enquiry.create({ name, email, phone, class_applying, message });
    res.status(201).json({ message: "Thank you! We will get back to you soon.", enquiry });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit enquiry.", error: err.message });
  }
};

// GET /api/enquiries (admin, management)
exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.findAll({ order: [["created_at", "DESC"]] });
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch enquiries.", error: err.message });
  }
};

// PUT /api/enquiries/:id (admin, management) - update status/notes
exports.updateEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id);
    if (!enquiry) return res.status(404).json({ message: "Enquiry not found." });
    await enquiry.update(req.body);
    await logAction(req, { action: "update", entity: "Enquiry", entityId: enquiry.id, details: req.body });
    res.json(enquiry);
  } catch (err) {
    res.status(500).json({ message: "Failed to update enquiry.", error: err.message });
  }
};

exports.deleteEnquiry = async (req, res) => {
  try {
    const enquiry = await Enquiry.findByPk(req.params.id);
    if (!enquiry) return res.status(404).json({ message: "Enquiry not found." });
    await enquiry.destroy();
    res.json({ message: "Enquiry deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete enquiry.", error: err.message });
  }
};
