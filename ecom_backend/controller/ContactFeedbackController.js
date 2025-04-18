// controllers/FeedbackController.js
const FeedbackModel = require("../models/FeedbackModel");

class FeedbackController {
  async getAllFeedback(req, res) {
    try {
      const feedback = await FeedbackModel.getAll();
      res.status(200).json(feedback);
    } catch (err) {
      console.error("Error retrieving feedback:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async getFeedbackById(req, res) {
    try {
      const feedback = await FeedbackModel.getById(req.params.id);
      if (!feedback)
        return res.status(404).json({ error: "Feedback not found" });
      res.status(200).json(feedback);
    } catch (err) {
      console.error("Error retrieving feedback:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async createFeedback(req, res) {
    try {
      const insertId = await FeedbackModel.create(req.body);
      res.status(200).json({
        message: "Feedback submitted successfully",
        feedbackId: insertId,
      });
    } catch (err) {
      console.error("Error creating feedback:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async updateFeedback(req, res) {
    try {
      await FeedbackModel.update(req.params.id, req.body);
      res.status(200).json({ message: "Feedback updated successfully" });
    } catch (err) {
      console.error("Error updating feedback:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async deleteFeedback(req, res) {
    try {
      await FeedbackModel.delete(req.params.id);
      res.status(200).json({ message: "Feedback deleted successfully" });
    } catch (err) {
      console.error("Error deleting feedback:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }
}

module.exports = new FeedbackController();
