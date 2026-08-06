const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const { User, Student, Teacher } = require("../models");

function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

// @route POST /api/auth/signup
// Public signup is only allowed for role "student" or "teacher" applying for
// an account; "admin" and "management" accounts should be created by an
// existing admin via /api/users (protected route) in a real deployment.
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }

    const allowedSelfSignupRoles = ["student", "teacher", "parent"];
    const finalRole = allowedSelfSignupRoles.includes(role) ? role : "student";

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
      phone,
    });

    // Auto-create a linked profile row so the record shows up in
    // Student/Teacher management screens immediately.
    if (finalRole === "student") {
      await Student.create({ user_id: user.id, name, email });
    } else if (finalRole === "teacher") {
      await Teacher.create({ user_id: user.id, name, email, phone });
    }

    const token = generateToken(user);
    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed.", error: err.message });
  }
};

// @route POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_active) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (user.two_factor_enabled) {
      // Short-lived pre-auth token proving password was correct, used only
      // to complete the 2FA challenge — not a full session token.
      const preAuthToken = jwt.sign({ id: user.id, stage: "2fa" }, process.env.JWT_SECRET, { expiresIn: "5m" });
      return res.json({ requires2FA: true, preAuthToken });
    }

    const token = generateToken(user);
    res.json({
      message: "Login successful.",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed.", error: err.message });
  }
};

// @route POST /api/auth/2fa/login-verify - completes login after password step
exports.verifyLoginOtp = async (req, res) => {
  try {
    const { preAuthToken, token: otp } = req.body;
    let decoded;
    try {
      decoded = jwt.verify(preAuthToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: "2FA session expired. Please log in again." });
    }
    if (decoded.stage !== "2fa") return res.status(401).json({ message: "Invalid 2FA session." });

    const user = await User.findByPk(decoded.id);
    if (!user || !user.two_factor_enabled) return res.status(400).json({ message: "2FA is not enabled for this account." });

    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: "base32",
      token: otp,
      window: 1,
    });
    if (!verified) return res.status(401).json({ message: "Invalid authentication code." });

    const finalToken = generateToken(user);
    res.json({
      message: "Login successful.",
      token: finalToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: "2FA verification failed.", error: err.message });
  }
};

// @route POST /api/auth/2fa/setup - generates a new secret + QR code (not yet enabled)
exports.setup2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({ name: `SchoolERP (${req.user.email})` });
    await User.update({ two_factor_secret: secret.base32 }, { where: { id: req.user.id } });
    const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);
    res.json({ qrDataUrl, secret: secret.base32 });
  } catch (err) {
    res.status(500).json({ message: "Failed to set up 2FA.", error: err.message });
  }
};

// @route POST /api/auth/2fa/enable - verifies first OTP and turns 2FA on
exports.enable2FA = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const verified = speakeasy.totp.verify({
      secret: user.two_factor_secret,
      encoding: "base32",
      token: req.body.token,
      window: 1,
    });
    if (!verified) return res.status(400).json({ message: "Invalid code. Please try again." });

    user.two_factor_enabled = true;
    await user.save();
    res.json({ message: "Two-factor authentication enabled." });
  } catch (err) {
    res.status(500).json({ message: "Failed to enable 2FA.", error: err.message });
  }
};

// @route POST /api/auth/2fa/disable
exports.disable2FA = async (req, res) => {
  try {
    await User.update(
      { two_factor_enabled: false, two_factor_secret: null },
      { where: { id: req.user.id } }
    );
    res.json({ message: "Two-factor authentication disabled." });
  } catch (err) {
    res.status(500).json({ message: "Failed to disable 2FA.", error: err.message });
  }
};

// @route PUT /api/auth/me - self-service profile update (name, phone, password only)
exports.updateMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const { name, phone, password } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (password) updates.password = await bcrypt.hash(password, 10);

    await user.update(updates);
    const { password: _pw, ...safeUser } = user.toJSON();
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile.", error: err.message });
  }
};

// @route GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch profile.", error: err.message });
  }
};
