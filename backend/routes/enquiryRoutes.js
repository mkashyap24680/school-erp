const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/enquiryController");

router.post("/", ctrl.submitEnquiry); // PUBLIC - no auth, admission enquiry form

router.get("/", protect, allowRoles("admin", "management"), ctrl.getAllEnquiries);
router.put("/:id", protect, allowRoles("admin", "management"), ctrl.updateEnquiry);
router.delete("/:id", protect, allowRoles("admin"), ctrl.deleteEnquiry);

module.exports = router;
