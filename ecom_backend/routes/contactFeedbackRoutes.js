const express = require("express");
const { contactFeedbackController } = require("../controller/index");

const router = express.Router();

// check naming convention
router.get("/contactusfeedback", contactFeedbackController.getAllFeedback);
router.get("/contactusfeedback/:id", contactFeedbackController.getFeedbackById);
router.post("/contactusfeedback", contactFeedbackController.createFeedback);
router.put("/contactusfeedback/:id", contactFeedbackController.updateFeedback);
router.delete("/contactusfeedback/:id", contactFeedbackController.deleteFeedback);

module.exports = router;
