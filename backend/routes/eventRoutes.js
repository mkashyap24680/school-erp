const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/eventController");

router.use(protect);
router.get("/", ctrl.getEvents);
router.post("/", allowRoles("admin", "management"), ctrl.createEvent);
router.delete("/:id", allowRoles("admin", "management"), ctrl.deleteEvent);

module.exports = router;
