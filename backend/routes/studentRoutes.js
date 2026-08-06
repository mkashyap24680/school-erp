const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/studentController");

router.use(protect);

router.get("/me/profile", allowRoles("student"), ctrl.getMyStudentProfile);
router.get("/", allowRoles("admin", "management", "teacher"), ctrl.getAllStudents);
router.get("/:id", allowRoles("admin", "management", "teacher"), ctrl.getStudentById);
router.post("/bulk", allowRoles("admin", "management"), ctrl.bulkCreateStudents);
router.post("/", allowRoles("admin", "management"), ctrl.createStudent);
router.put("/:id", allowRoles("admin", "management"), ctrl.updateStudent);
router.delete("/:id", allowRoles("admin"), ctrl.deleteStudent);

module.exports = router;
