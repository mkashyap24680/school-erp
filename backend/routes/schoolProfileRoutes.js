const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/schoolProfileController");

router.get("/", ctrl.getProfile); // PUBLIC - needed for login page branding
router.put("/", protect, allowRoles("admin"), ctrl.updateProfile);

module.exports = router;
