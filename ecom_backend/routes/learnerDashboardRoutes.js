const express = require("express");
const router = express.Router();
const learnerDashboardController = require("../controller/LearnerDashboardController");

// GET endpoint for learner dashboard data
router.get("/learnerDashboard", learnerDashboardController.getDashboardData);
router.get("/learnerDashboard/course/:enrollmentId", learnerDashboardController.getCourseModules);
router.put("/learnerDashboard/course/:enrollmentId/module/:moduleId/complete", learnerDashboardController.completeModule);


module.exports = router;
