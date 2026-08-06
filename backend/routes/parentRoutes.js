const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/parentController");

router.use(protect, allowRoles("parent"));

router.get("/children", ctrl.getMyChildren);
router.get("/children/:studentId/attendance", ctrl.getChildAttendance);
router.get("/children/:studentId/fees", ctrl.getChildFees);
router.get("/children/:studentId/results", ctrl.getChildResults);

module.exports = router;
