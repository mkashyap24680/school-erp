const express = require("express");
const router = express.Router();
const { signup, login, getMe, updateMe, verifyLoginOtp, setup2FA, enable2FA, disable2FA } = require("../controllers/authController");
const protect = require("../middleware/auth");

router.post("/signup", signup);
router.post("/login", login);
router.post("/2fa/login-verify", verifyLoginOtp);
router.get("/me", protect, getMe);
router.put("/me", protect, updateMe);
router.post("/2fa/setup", protect, setup2FA);
router.post("/2fa/enable", protect, enable2FA);
router.post("/2fa/disable", protect, disable2FA);

module.exports = router;
