const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/attendanceController");

router.use(protect);

router.get("/me", allowRoles("student"), ctrl.getMyAttendance);
router.get("/summary", allowRoles("admin", "management", "teacher"), ctrl.getAttendanceSummary);
router.get("/", allowRoles("admin", "management", "teacher"), ctrl.getAttendance);
router.post("/bulk", allowRoles("admin", "teacher"), ctrl.markBulkAttendance);

module.exports = router;
