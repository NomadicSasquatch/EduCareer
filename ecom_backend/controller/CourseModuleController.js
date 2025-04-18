const CourseModuleModel = require("../models/CourseModuleModel");

class CourseModuleController {
  async getAllModulesForCourse(req, res) {
    const courseId = req.params.courseId;
    try {
      const modules = await CourseModuleModel.getAllForCourse(courseId);
      res.status(200).json(modules);
    } catch (err) {
      console.error("Error retrieving CourseModule:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async getModuleById(req, res) {
    const { courseId, moduleId } = req.params;
    try {
      const moduleData = await CourseModuleModel.getById(courseId, moduleId);
      if (!moduleData) {
        return res.status(404).json({ error: "Module not found" });
      }
      res.status(200).json(moduleData);
    } catch (err) {
      console.error("Error retrieving module:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async createModule(req, res) {
    const courseId = req.params.courseId;
    const { moduleName, moduleContent } = req.body;
    try {
      const newModule = await CourseModuleModel.create(courseId, { moduleName, moduleContent });
      res.status(201).json({ message: "Module created successfully", moduleId: newModule.module_id });
    } catch (err) {
      console.error("Error creating module:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async updateModule(req, res) {
    const { courseId, moduleId } = req.params;
    const { moduleName, moduleContent } = req.body;
    try {
      await CourseModuleModel.update(moduleId, { moduleName, moduleContent, courseId });
      res.status(200).json({ message: "Module updated successfully" });
    } catch (err) {
      console.error("Error updating module:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async deleteModule(req, res) {
    const { courseId, moduleId } = req.params;
    try {
      await CourseModuleModel.delete(moduleId);
      res.status(200).json({ message: "Module deleted successfully" });
    } catch (err) {
      console.error("Error deleting module:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }
}

module.exports = new CourseModuleController();