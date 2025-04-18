const express = require('express');
const { courseReviewController } = require("../controller/index");

const router = express.Router();

// consider composite vs unique keys for the reviews
router.get('/courses/:courseId/reviews', courseReviewController.getAllReviewsForCourse);
router.get('/courses/reviews', courseReviewController.getAllReviewsForCourse);
router.get('/courses/:courseId/reviews/:reviewId', courseReviewController.getReviewById);
router.post('/courses/:courseId/reviews', courseReviewController.createReview);
router.post('/courses/reviews', courseReviewController.createReview);
router.put('/courses/reviews/:reviewId', courseReviewController.updateReview);
router.delete('/courses/reviews/:reviewId', courseReviewController.deleteReview);

module.exports = router;
