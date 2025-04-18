const express = require("express");
const { moduleProgressController } = require("../controller/index");
const router = express.Router();

router.get("/module-progress", moduleProgressController.getAllModuleProgress);
router.get("/module-progress/:id", moduleProgressController.getModuleProgressById);
router.post("/module-progress", moduleProgressController.createModuleProgress);
router.put("/module-progress/:id", moduleProgressController.updateModuleProgress);
router.delete("/module-progress/:id", moduleProgressController.deleteModuleProgress);

module.exports = router;
