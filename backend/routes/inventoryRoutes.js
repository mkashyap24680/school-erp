const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const ctrl = require("../controllers/inventoryController");

router.use(protect, allowRoles("admin", "management"));
router.get("/", ctrl.getAllItems);
router.post("/", ctrl.createItem);
router.put("/:id", ctrl.updateItem);
router.delete("/:id", ctrl.deleteItem);

module.exports = router;
