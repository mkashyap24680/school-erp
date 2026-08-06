const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/homeworkController");

router.use(protect);

router.get("/me", allowRoles("student"), ctrl.getMyAssignments);
router.get("/", allowRoles("admin", "management", "teacher"), ctrl.getAssignments);
router.post("/", allowRoles("admin", "management", "teacher"), ctrl.createAssignment);
router.delete("/:id", allowRoles("admin", "management", "teacher"), ctrl.deleteAssignment);

router.get("/:id/submissions", allowRoles("admin", "management", "teacher"), ctrl.getSubmissions);
router.post("/:id/submit", allowRoles("student"), ctrl.submitAssignment);
router.put("/submissions/:id/grade", allowRoles("admin", "management", "teacher"), ctrl.gradeSubmission);

module.exports = router;
