const express = require("express");
const router = express.Router();
const { certificateController } = require("../controller/index");

router.post("/certificate/email", certificateController.emailCertificate);

module.exports = router;
