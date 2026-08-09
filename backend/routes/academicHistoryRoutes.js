const express = require("express");
const router = express.Router();

const {
  getStudentAcademicHistory,
  createAcademicHistory,
  updateAcademicHistory,
  promoteStudent,
} = require("../controllers/academicHistoryController");

// Get student's academic history
router.get(
  "/student/:studentId",
  getStudentAcademicHistory
);

// Create academic history
router.post(
  "/",
  createAcademicHistory
);

// Update academic history
router.put(
  "/:id",
  updateAcademicHistory
);

// Promote student
router.post(
  "/promote/:studentId",
  promoteStudent
);

module.exports = router;
