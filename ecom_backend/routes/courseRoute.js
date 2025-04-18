const express = require("express");
const { courseController } = require("../controller/index");

const router = express.Router();

router.get("/getAllCourses", courseController.getAllCourses);
router.get("/getCourse/:id", courseController.getCourseById);
router.post("/createCourse", courseController.createCourse);
router.put("/updateCourse/:id", courseController.updateCourse);
router.delete("/deleteCourse/:id", courseController.deleteCourse);
router.get("/providerCourses", courseController.getProviderCourses);
router.get("/courseEnrolledStudents", courseController.getEnrolledStudentsForCourse);
router.get("/providerEnrollments", courseController.getEnrolledStudentsForProvider);
router.post('/courseModule', courseController.addCourseModule);
router.get('/courseModules', courseController.getCourseModules);
router.put('/courseModule/:module_id', courseController.updateCourseModule);

module.exports = router;
