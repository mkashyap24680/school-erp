const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/leaveController");

router.use(protect);

router.get("/", ctrl.getLeaveRequests);
router.post("/", ctrl.applyLeave);
router.put("/:id/review", allowRoles("admin", "management"), ctrl.reviewLeave);

module.exports = router;
