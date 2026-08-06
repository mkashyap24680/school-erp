const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/dashboardController");

router.use(protect);

router.get("/stats", allowRoles("admin", "management", "teacher"), ctrl.getStats);
router.get("/attendance-trend", allowRoles("admin", "management", "teacher"), ctrl.getAttendanceTrend);

module.exports = router;
