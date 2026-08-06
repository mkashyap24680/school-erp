const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/transportController");

router.use(protect);

router.get("/routes/me", allowRoles("student"), ctrl.getMyRoute);
router.get("/vehicles", allowRoles("admin", "management"), ctrl.getAllVehicles);
router.post("/vehicles", allowRoles("admin", "management"), ctrl.createVehicle);
router.delete("/vehicles/:id", allowRoles("admin"), ctrl.deleteVehicle);

router.get("/routes", allowRoles("admin", "management"), ctrl.getAllRoutes);
router.post("/routes", allowRoles("admin", "management"), ctrl.createRoute);
router.put("/routes/:id", allowRoles("admin", "management"), ctrl.updateRoute);
router.delete("/routes/:id", allowRoles("admin"), ctrl.deleteRoute);

router.post("/assign", allowRoles("admin", "management"), ctrl.assignStudent);

module.exports = router;
