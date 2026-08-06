const { LeaveRequest } = require("../models");
const { notifyUser } = require("../utils/notify");
const { logAction } = require("../utils/audit");

// GET /api/leave - admin/management see all, others see their own
exports.getLeaveRequests = async (req, res) => {
  try {
    const where = ["admin", "management"].includes(req.user.role) ? {} : { applicant_user_id: req.user.id };
    const requests = await LeaveRequest.findAll({ where, order: [["created_at", "DESC"]] });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch leave requests.", error: err.message });
  }
};

// POST /api/leave - any logged-in user can apply
exports.applyLeave = async (req, res) => {
  try {
    const { from_date, to_date, reason } = req.body;
    const request = await LeaveRequest.create({
      applicant_user_id: req.user.id,
      applicant_name: req.user.name,
      applicant_role: req.user.role,
      from_date, to_date, reason,
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: "Failed to submit leave request.", error: err.message });
  }
};

// PUT /api/leave/:id/review (admin, management) - approve or reject
exports.reviewLeave = async (req, res) => {
  try {
    const { status, review_note } = req.body; // "approved" | "rejected"
    const request = await LeaveRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ message: "Leave request not found." });

    request.status = status;
    request.review_note = review_note;
    request.reviewed_by = req.user.id;
    await request.save();

    await notifyUser(request.applicant_user_id, {
      title: `Leave Request ${status === "approved" ? "Approved" : "Rejected"}`,
      message: `Your leave request (${request.from_date} to ${request.to_date}) was ${status}.${review_note ? " Note: " + review_note : ""}`,
      type: "leave",
    });

    await logAction(req, { action: "update", entity: "LeaveRequest", entityId: request.id, details: { status } });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: "Failed to review leave request.", error: err.message });
  }
};
