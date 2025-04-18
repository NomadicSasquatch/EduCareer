const authenticationController = require("./AuthenticationController");
const contactFeedbackController = require("./ContactFeedbackController");
// const courseModuleController = require("./CourseModuleController");
const courseReviewController = require("./CourseReviewController");
const courseEnrollmentController = require("./CourseEnrollmentController");
// const courseAttendanceController = require("./CourseAttendanceController");
const skillsfutureController = require("./SkillsfutureController");
const learnerProfileController = require("./LearnerProfileController");
const providerProfileController = require("./ProviderProfileController");
const userAccountController = require("./UserAccountController");
const moduleProgressController = require("./ModuleProgressController");
const adminController = require("./AdminController");
const courseController = require("./CourseController");
const certificateController = require("./CertificateController");

module.exports = {
  authenticationController,
  skillsfutureController,
  contactFeedbackController,
  // courseModuleController,
  courseReviewController,
  courseEnrollmentController,
  learnerProfileController,
  providerProfileController,
  userAccountController,
  moduleProgressController,
  adminController,
  courseController,
  certificateController,
};
