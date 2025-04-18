const EnrollmentModel = require("../models/CourseEnrollmentModel");

class EnrollmentController {
  async getAllEnrollments(req, res) {
    try {
      const enrollments = await EnrollmentModel.getAll();
      res.status(200).json(enrollments);
    } catch (err) {
      console.error("Error retrieving enrollments:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async getEnrollmentById(req, res) {
    const enrollmentId = req.params.enrollmentId;
    try {
      const enrollment = await EnrollmentModel.getById(enrollmentId);
      if (!enrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }
      res.status(200).json(enrollment);
    } catch (err) {
      console.error("Error retrieving enrollment:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async checkUserEnrollment(req, res) {
    const { courseId } = req.params;
    const { userId } = req.query;
    try {
      const isEnrolled = await EnrollmentModel.checkUserEnrollment(courseId, userId);
      res.status(200).json({ isEnrolled });
    } catch (err) {
      console.error("Error checking enrollment:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async createEnrollment(req, res) {
    try {
      const newEnrollment = await EnrollmentModel.create(req.body);
      res.status(201).json({
        message: "Enrollment created successfully",
        enrollment_id: newEnrollment.enrollment_id
      });
    } catch (err) {
      console.error("Error creating enrollment:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async updateEnrollment(req, res) {
    const enrollmentId = req.params.enrollmentId;
    try {
      await EnrollmentModel.update(enrollmentId, req.body);
      res.status(200).json({ message: "Enrollment updated successfully" });
    } catch (err) {
      console.error("Error updating enrollment:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async deleteEnrollment(req, res) {
    const enrollmentId = req.params.enrollmentId;
    try {
      await EnrollmentModel.delete(enrollmentId);
      res.status(200).json({ message: "Enrollment deleted successfully" });
    } catch (err) {
      console.error("Error deleting enrollment:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }
}

module.exports = new EnrollmentController();