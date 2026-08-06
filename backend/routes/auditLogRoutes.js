const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/auditLogController");

router.use(protect, allowRoles("admin"));
router.get("/", ctrl.getLogs);

module.exports = router;
