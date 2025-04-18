const express = require("express");
const { authenticationController } = require("../controller/index");

const router = express.Router();

//Authentication Routes
router.post("/login", authenticationController.loginUser);
router.post("/register", authenticationController.registerUser);
router.get("/check-session", authenticationController.checkSession);
router.post("/logout", authenticationController.logoutUser);
router.get("/verify-email", authenticationController.verifyEmail);
router.post("/forgot-password", authenticationController.forgotPassword);
router.post("/reset-password", authenticationController.resetPassword);

module.exports = router;
