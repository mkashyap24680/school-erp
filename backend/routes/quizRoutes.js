const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/quizController");

router.use(protect);

router.get("/me", allowRoles("student"), ctrl.getMyQuizzes);
router.get("/", allowRoles("admin", "management", "teacher"), ctrl.getQuizzes);
router.post("/", allowRoles("admin", "management", "teacher"), ctrl.createQuiz);
router.get("/:id", ctrl.getQuizById);
router.delete("/:id", allowRoles("admin", "management", "teacher"), ctrl.deleteQuiz);
router.post("/:id/attempt", allowRoles("student"), ctrl.submitAttempt);
router.get("/:id/results", allowRoles("admin", "management", "teacher"), ctrl.getQuizResults);

module.exports = router;
