const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/timetableController");

router.use(protect);

router.get("/me", allowRoles("student", "teacher"), ctrl.getMyTimetable);
router.get("/", allowRoles("admin", "management", "teacher"), ctrl.getTimetable);
router.post("/", allowRoles("admin", "management"), ctrl.createSlot);
router.put("/:id", allowRoles("admin", "management"), ctrl.updateSlot);
router.delete("/:id", allowRoles("admin", "management"), ctrl.deleteSlot);

module.exports = router;
