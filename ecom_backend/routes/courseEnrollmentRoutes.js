const express = require('express');
const { courseEnrollmentController } = require("../controller/index");

const router = express.Router();

router.get('/courses/:courseId/enrollments', courseEnrollmentController.getAllEnrollments);
router.get('/courses/:courseId/enrollments/:enrollmentId', courseEnrollmentController.getEnrollmentById);
router.get('/courses/:courseId/enrollment-check', courseEnrollmentController.checkUserEnrollment);
router.post('/courses/:courseId/enrollments', courseEnrollmentController.createEnrollment);
router.put('/courses/:courseId/enrollments/:enrollmentId', courseEnrollmentController.updateEnrollment);
router.delete('/courses/:courseId/enrollments/:enrollmentId', courseEnrollmentController.deleteEnrollment);

module.exports = router;