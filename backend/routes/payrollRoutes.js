const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/payrollController");

router.use(protect, allowRoles("admin"));

router.get("/", ctrl.getAllPayroll);
router.post("/", ctrl.createPayroll);
router.put("/:id", ctrl.updatePayroll);
router.delete("/:id", ctrl.deletePayroll);

module.exports = router;
