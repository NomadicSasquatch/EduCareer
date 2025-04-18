const CourseModel = require("../models/CourseModel");

class CourseController {
  async getAllCourses(req, res) {
    const { keyword } = req.query;
    try {
      const courses = await CourseModel.getAll(keyword);
      res.status(200).json({ data: courses });
    } catch (err) {
      console.error("Error fetching courses:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async getCourseById(req, res) {
    const courseId = req.params.id;
    try {
      const courseData = await CourseModel.getById(courseId);
      if (!courseData) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.status(200).json({ courseData });
    } catch (err) {
      console.error("Error fetching course by id:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async createCourse(req, res) {
    try {
      const newCourse = await CourseModel.create(req.body);
      res.status(201).json({
        message: "Course created successfully",
        data: { courseId: newCourse.course_id }
      });
    } catch (err) {
      console.error("Error creating course:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async updateCourse(req, res) {
    const courseId = req.params.id;
    try {
      await CourseModel.update(courseId, req.body);
      res.status(200).json({ message: "Course updated successfully" });
    } catch (err) {
      console.error("Error updating course:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async deleteCourse(req, res) {
    const courseId = req.params.id;
    const { creator_id } = req.query;
    if (!creator_id) {
      return res.status(400).json({ error: "creator_id is required" });
    }
    try {
      const deleted = await CourseModel.delete(courseId, creator_id);
      if (!deleted) {
        return res.status(404).json({
          error: "Course not found or you are not authorized to delete it"
        });
      }
      res.status(200).json({ message: "Course deleted successfully" });
    } catch (err) {
      console.error("Error deleting course:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async getProviderCourses(req, res) {
    const { id: creator_id } = req.query;
    if (!creator_id) {
      return res.status(400).json({ error: "creator_id is required" });
    }
    try {
      const courses = await CourseModel.getProviderCourses(creator_id);
      res.status(200).json({ data: courses });
    } catch (err) {
      console.error("Error fetching provider courses:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async getEnrolledStudentsForCourse(req, res) {
    const { courseId } = req.query;
    if (!courseId) {
      return res.status(400).json({ error: "course_id is required" });
    }
    try {
      const students = await CourseModel.getEnrolledStudentsForCourse(courseId);
      res.status(200).json({ data: students });
    } catch (err) {
      console.error("Error fetching enrolled students:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async getEnrolledStudentsForProvider(req, res) {
    const { creator_id } = req.query;
    if (!creator_id) {
      return res.status(400).json({ error: "creator_id is required" });
    }
    try {
      const students = await CourseModel.getEnrolledStudentsForProvider(creator_id);
      res.status(200).json({ data: students });
    } catch (err) {
      console.error("Error fetching enrolled students for provider:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async addCourseModule(req, res) {
    try {
      const moduleResult = await CourseModel.addModule(req.body);
      res.status(201).json({
        message: "Course module added successfully!",
        module_id: moduleResult.module_id
      });
    } catch (err) {
      console.error("Error adding course module:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async getCourseModules(req, res) {
    const { course_id } = req.query;
    if (!course_id) {
      return res.status(400).json({ error: "course_id is required" });
    }
    try {
      const modules = await CourseModel.getModules(course_id);
      res.status(200).json({ data: modules });
    } catch (err) {
      console.error("Error fetching course modules:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }

  async updateCourseModule(req, res) {
    const { module_id } = req.params;
    if (!module_id) {
      return res.status(400).json({ error: "module_id is required" });
    }
    try {
      const updated = await CourseModel.updateModule(module_id, req.body);
      if (updated) {
        res.status(200).json({ message: "Module updated successfully" });
      } else {
        res.status(404).json({ error: "Module not found or not updated" });
      }
    } catch (err) {
      console.error("Error updating module:", err.message);
      res.status(500).json({ error: "Database query failed" });
    }
  }
}

module.exports = new CourseController();