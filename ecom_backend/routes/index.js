const express = require("express");
const authRoutes = require("./authRoutes");
const learnerProfileRoutes = require("./learnerProfileRoutes");
const providerProfileRoutes = require("./providerProfileRoutes");
const userAccountRoutes = require("./userAccountRoutes");
const moduleProgressRoutes = require("./moduleProgressRoutes");
const adminRoutes = require("./adminRoutes");
const courseRoutes = require("./courseRoute");

const skillsfutureRoutes = require("./skillsfutureRoutes");
const contactFeedbackRoutes = require("./contactFeedbackRoutes");
// const courseModuleRoutes = require("./courseModuleRoutes");
const courseReviewRoutes = require("./courseReviewRoutes");
const courseEnrollmentRoutes = require("./courseEnrollmentRoutes");
const learnerDashboard = require("./learnerDashboardRoutes");
const certificateRoutes = require("./certificateRoutes");

const router = express.Router();

// Use specific routes
router.use(authRoutes);
// router.use(skillsfutureRoutes);
// router.use(adminRoutes);
router.use(contactFeedbackRoutes);
// router.use(courseModuleRoutes);
router.use(courseReviewRoutes);
router.use(courseEnrollmentRoutes);
// router.use(courseAttendanceRoutes);
router.use(learnerProfileRoutes);
router.use(providerProfileRoutes);
router.use(userAccountRoutes);
router.use(moduleProgressRoutes);
router.use(adminRoutes);
router.use(courseRoutes);
router.use(learnerDashboard);
router.use(certificateRoutes);

router.use("/skillsfuture", skillsfutureRoutes);

module.exports = router;
