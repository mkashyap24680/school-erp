const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/examController");

router.use(protect);

router.get("/results/me", allowRoles("student"), ctrl.getMyResults);
router.get("/results/student/:studentId", allowRoles("admin", "management", "teacher"), ctrl.getResultsForStudent);
router.get("/", allowRoles("admin", "management", "teacher", "student"), ctrl.getAllExams);
router.post("/", allowRoles("admin", "management", "teacher"), ctrl.createExam);
router.put("/:id", allowRoles("admin", "management", "teacher"), ctrl.updateExam);
router.delete("/:id", allowRoles("admin"), ctrl.deleteExam);

router.get("/:examId/results", allowRoles("admin", "management", "teacher"), ctrl.getResultsForExam);
router.post(
  "/:examId/results/bulk",
  allowRoles("admin", "management", "teacher"),
  ctrl.enterResultsBulk
);

module.exports = router;
