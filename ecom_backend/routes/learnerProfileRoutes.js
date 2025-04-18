const express = require("express");
const { learnerProfileController } = require("../controller/index");
const router = express.Router();
const upload = require('../services/multerConfig');

router.get("/learner-profiles", learnerProfileController.getAllLearnerProfiles);
router.get("/learner-profiles/:id", learnerProfileController.getLearnerProfileData);
router.post("/learner-profiles", learnerProfileController.createLearnerProfile);
router.put("/learner-profiles/:id", learnerProfileController.updateLearnerProfile);
router.delete("/learner-profiles/:id", learnerProfileController.deleteLearnerProfile);
router.get('/learnerProfileData/:user_id', learnerProfileController.getLearnerProfileData); // for fetching learnner Profile Data
router.post('/learnerProfileData/updateAbout', learnerProfileController.updateAboutMyself); // update About Myself
router.post('/learnerProfileData/uploadImage', upload.single('image'), learnerProfileController.uploadImage);

module.exports = router;
