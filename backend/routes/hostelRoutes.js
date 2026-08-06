const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/hostelController");

router.use(protect, allowRoles("admin", "management"));

router.get("/", ctrl.getAllHostels);
router.post("/", ctrl.createHostel);
router.delete("/:id", ctrl.deleteHostel);

router.post("/rooms", ctrl.createRoom);
router.delete("/rooms/:id", ctrl.deleteRoom);

router.post("/allot", ctrl.allotStudent);

module.exports = router;
