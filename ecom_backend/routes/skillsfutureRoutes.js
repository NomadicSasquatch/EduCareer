const express = require("express");
const router = express.Router();
const { skillsfutureController } = require("../controller/index");

router.get("/get-token", skillsfutureController.getAccessToken);
router.get("/courses", skillsfutureController.fetchCourses);
router.get("/courseTag", skillsfutureController.fetchCourseTag);

module.exports = router;
