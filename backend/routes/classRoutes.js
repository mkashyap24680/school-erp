const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/classController");

router.use(protect);

router.get("/", allowRoles("admin", "management", "teacher", "student"), ctrl.getAllClasses);
router.get("/:id", allowRoles("admin", "management", "teacher", "student"), ctrl.getClassById);
router.post("/", allowRoles("admin", "management"), ctrl.createClass);
router.put("/:id", allowRoles("admin", "management"), ctrl.updateClass);
router.delete("/:id", allowRoles("admin"), ctrl.deleteClass);

module.exports = router;
