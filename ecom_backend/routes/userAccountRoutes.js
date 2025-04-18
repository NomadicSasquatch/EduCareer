const express = require("express");
const { userAccountController } = require("../controller/index");
const router = express.Router();

router.get("/useraccounts", userAccountController.getAllUserAccounts);
router.get("/useraccounts/:id", userAccountController.getUserAccountById);
router.post("/useraccounts", userAccountController.createUserAccount);
router.put("/useraccounts/:id", userAccountController.updateUserAccount);
router.delete("/useraccounts/:id", userAccountController.deleteUserAccount);

module.exports = router;
