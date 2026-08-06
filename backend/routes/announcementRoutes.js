const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/announcementController");

router.use(protect);

router.get("/", ctrl.getAnnouncements);
router.post("/", allowRoles("admin", "management"), ctrl.createAnnouncement);
router.delete("/:id", allowRoles("admin", "management"), ctrl.deleteAnnouncement);

module.exports = router;
