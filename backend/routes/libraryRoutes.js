const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/libraryController");

router.use(protect);

router.get("/issues/me", allowRoles("student"), ctrl.getMyIssues);

router.get(
  "/books",
  allowRoles("admin", "management", "teacher", "student"),
  ctrl.getAllBooks
);

router.post(
  "/books",
  allowRoles("admin", "management"),
  ctrl.createBook
);

router.put(
  "/books/:id",
  allowRoles("admin", "management"),
  ctrl.updateBook
);

router.delete(
  "/books/:id",
  allowRoles("admin"),
  ctrl.deleteBook
);

router.get(
  "/issues",
  allowRoles("admin", "management"),
  ctrl.getAllIssues
);

router.post(
  "/issues",
  allowRoles("admin", "management"),
  ctrl.issueBook
);

router.put(
  "/issues/:id/return",
  allowRoles("admin", "management"),
  ctrl.returnBook
);

module.exports = router;
