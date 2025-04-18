const CourseReviewModel = require("../models/CourseReviewModel");

class CourseReviewController {
  async getAllReviewsForCourse(req, res) {
    const courseId = req.params.courseId;
    const { externalReferenceNumber } = req.query;

    try {
      const reviews = await CourseReviewModel.getReviews({ courseId, externalReferenceNumber });
      res.status(200).json(reviews);
    } catch (err) {
      console.error("Error retrieving CourseReview:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async getReviewById(req, res) {
    const { reviewId } = req.params;
    try {
      const review = await CourseReviewModel.getById(reviewId);
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }
      res.status(200).json(review);
    } catch (err) {
      console.error("Error retrieving review:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async createReview(req, res) {
    const courseId = req.params.courseId;
    const { rating, comment, userId, externalReferenceNumber } = req.body;
    try {
      const result = await CourseReviewModel.createReview({
        courseId,
        userId,
        rating,
        comment,
        externalReferenceNumber,
      });
      res.status(201).json({ message: "Review created successfully", reviewId: result.reviewId });
    } catch (err) {
      console.error("Error creating review:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async updateReview(req, res) {
    const reviewId = req.params.reviewId;
    const { rating, comment } = req.body;
    try {
      await CourseReviewModel.updateReview(reviewId, { rating, comment });
      res.status(200).json({ message: "Review updated successfully" });
    } catch (err) {
      console.error("Error updating review:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async deleteReview(req, res) {
    const reviewId = req.params.reviewId;
    try {
      await CourseReviewModel.deleteReview(reviewId);
      res.status(200).json({ message: "Review deleted successfully" });
    } catch (err) {
      console.error("Error deleting review:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }
}

module.exports = new CourseReviewController();