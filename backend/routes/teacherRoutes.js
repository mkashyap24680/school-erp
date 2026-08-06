const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/teacherController");

router.use(protect);

router.get("/me/profile", allowRoles("teacher"), ctrl.getMyTeacherProfile);
router.get("/", allowRoles("admin", "management", "teacher"), ctrl.getAllTeachers);
router.get("/:id", allowRoles("admin", "management", "teacher"), ctrl.getTeacherById);
router.post("/bulk", allowRoles("admin", "management"), ctrl.bulkCreateTeachers);
router.post("/", allowRoles("admin", "management"), ctrl.createTeacher);
router.put("/:id", allowRoles("admin", "management"), ctrl.updateTeacher);
router.delete("/:id", allowRoles("admin"), ctrl.deleteTeacher);

module.exports = router;
