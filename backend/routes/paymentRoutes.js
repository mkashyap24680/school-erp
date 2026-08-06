const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/paymentController");

router.use(protect, allowRoles("student"));
router.get("/me", ctrl.getMyPayments);
router.post("/order", ctrl.createOrder);
router.post("/confirm", ctrl.confirmPayment);

module.exports = router;
