const { SchoolProfile } = require("../models");

// GET /api/school-profile - public (needed by login page for branding)
exports.getProfile = async (req, res) => {
  try {
    let profile = await SchoolProfile.findOne();
    if (!profile) profile = await SchoolProfile.create({});
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch school profile.", error: err.message });
  }
};

// PUT /api/school-profile (admin only)
exports.updateProfile = async (req, res) => {
  try {
    let profile = await SchoolProfile.findOne();
    if (!profile) profile = await SchoolProfile.create({});
    await profile.update(req.body);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Failed to update school profile.", error: err.message });
  }
};
