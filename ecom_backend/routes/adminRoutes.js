const express = require("express");
const router = express.Router();
const { adminController } = require("../controller/index");

// update and get adminManagementPage Table
router.get("/admin/data", adminController.getAdminTableData);
router.post("/admin/data", adminController.createAdminAccount);
router.put("/admin/data", adminController.updateAdminTableData);

module.exports = router;
