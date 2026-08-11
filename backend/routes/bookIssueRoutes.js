const express = require("express");
const router = express.Router();

const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/bookIssueController");

router.use(protect);

// ---------------------------------------------------------
// Books
// ---------------------------------------------------------

// Get all books
router.get(
  "/books",
  allowRoles("admin", "management", "teacher", "student"),
  ctrl.getAllBooks
);

// Create book
router.post(
  "/books",
  allowRoles("admin", "management"),
  ctrl.createBook
);

// Update book
router.put(
  "/books/:id",
  allowRoles("admin", "management"),
  ctrl.updateBook
);

// Delete book
router.delete(
  "/books/:id",
  allowRoles("admin"),
  ctrl.deleteBook
);

// ---------------------------------------------------------
// Book Issues
// ---------------------------------------------------------

// Get all issued books
router.get(
  "/issues",
  allowRoles("admin", "management", "teacher"),
  ctrl.getAllIssues
);

// Student's own issued books
router.get(
  "/issues/me",
  allowRoles("student"),
  ctrl.getMyIssues
);

// Issue book to student
router.post(
  "/issues",
  allowRoles("admin", "management"),
  ctrl.issueBook
);

// Return book
router.put(
  "/issues/:id/return",
  allowRoles("admin", "management"),
  ctrl.returnBook
);

module.exports = router;
