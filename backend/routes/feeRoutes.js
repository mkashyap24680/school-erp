const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/feeController");

router.use(protect);

router.get("/me", allowRoles("student"), ctrl.getMyFees);
router.get("/", allowRoles("admin", "management"), ctrl.getAllFees);
router.post("/", allowRoles("admin", "management"), ctrl.createFee);
router.put("/:id", allowRoles("admin", "management"), ctrl.updateFee);
router.delete("/:id", allowRoles("admin"), ctrl.deleteFee);

module.exports = router;
