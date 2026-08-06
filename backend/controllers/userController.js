const bcrypt = require("bcryptjs");
const { User, Student, Teacher } = require("../models");
const { logAction } = require("../utils/audit");

// GET /api/users (admin only) - manage all logins & roles
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ["password"] }, order: [["name", "ASC"]] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users.", error: err.message });
  }
};

// POST /api/users (admin only) - create admin/management/teacher/student login
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "name, email, password and role are required." });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email already in use." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role, phone });

    if (role === "student") {
      await Student.create({ user_id: user.id, name, email });
    } else if (role === "teacher") {
      await Teacher.create({ user_id: user.id, name, email, phone });
    }

    await logAction(req, { action: "create", entity: "User", entityId: user.id, details: { email, role } });
    const { password: _, ...safeUser } = user.toJSON();
    res.status(201).json(safeUser);
  } catch (err) {
    res.status(500).json({ message: "Failed to create user.", error: err.message });
  }
};

// PUT /api/users/:id (admin only) - change role / activate-deactivate
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const { password, ...rest } = req.body;
    const updates = { ...rest };
    if (password) updates.password = await bcrypt.hash(password, 10);

    await user.update(updates);
    await logAction(req, { action: "update", entity: "User", entityId: user.id, details: { ...rest, passwordChanged: !!password } });
    const { password: _, ...safeUser } = user.toJSON();
    res.json(safeUser);
  } catch (err) {
    res.status(500).json({ message: "Failed to update user.", error: err.message });
  }
};

// DELETE /api/users/:id (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.id === req.user.id) {
      return res.status(400).json({ message: "You cannot delete your own account." });
    }
    await logAction(req, { action: "delete", entity: "User", entityId: user.id, details: { email: user.email } });
    await user.destroy();
    res.json({ message: "User deleted." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user.", error: err.message });
  }
};
