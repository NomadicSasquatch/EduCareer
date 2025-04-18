const LearnerDashboardModel = require("../models/LearnerDashboardModel");

class LearnerDashboardController {
  // GET /api/learnerDashboard?learnerId=...
  async getDashboardData(req, res) {
    try {
      const { learnerId } = req.query;
      if (!learnerId) {
        return res.status(400).json({ error: "Learner ID is required" });
      }
      const enrollments = await LearnerDashboardModel.getDashboardData(
        learnerId
      );
      res.status(200).json({ enrollments });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // GET /api/learnerDashboard/course/:enrollmentId
  async getCourseModules(req, res) {
    try {
      console.log("getCourseModules");
      const { enrollmentId } = req.params;
      if (!enrollmentId) {
        return res.status(400).json({ error: "Enrollment ID is required" });
      }
      const enrollment = await LearnerDashboardModel.getEnrollmentById(enrollmentId);
      if (!enrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      const modules = await LearnerDashboardModel.getModulesForEnrollment(enrollmentId);

      // Return a combined object
      res.json({
        course_name: enrollment.name,
        enrollment_id: enrollment.enrollment_id,
        completion_percentage: enrollment.completion_percentage,
        modules,
      });
    } catch (error) {
      console.error("Error fetching course modules:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  // PUT /api/learnerDashboard/course/:enrollmentId/module/:moduleId/complete
  async completeModule(req, res) {
    try {
      const { enrollmentId, moduleId } = req.params;
      const updated = await LearnerDashboardModel.markModuleAsCompleted(enrollmentId, moduleId);
      if (!updated) {
        return res.status(404).json({ error: "Module update failed or module not found" });
      }
      await LearnerDashboardModel.recalculateEnrollmentCompletion(enrollmentId);
      return res.json({ message: "Module marked as completed" });
    } catch (error) {
      console.error("Error completing module:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new LearnerDashboardController();
