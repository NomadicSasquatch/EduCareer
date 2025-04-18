const express = require("express");
const { providerProfileController } = require("../controller/index");
const router = express.Router();

router.get("/provider-profiles", providerProfileController.getAllProviderProfiles);
router.get("/provider-profiles/:id", providerProfileController.getProviderProfileById);
router.post("/provider-profiles", providerProfileController.createProviderProfile);
router.put("/provider-profiles/:id", providerProfileController.updateProviderProfile);
router.delete("/provider-profiles/:id", providerProfileController.deleteProviderProfile);

module.exports = router;