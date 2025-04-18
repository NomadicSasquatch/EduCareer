const db = require("../db");

class LearnerDashboardModel {
  // Get all enrolled courses for the given user
  static async getDashboardData(userId) {
    const query = `
      SELECT 
        ce.enrollment_id,
        ce.completion_percentage,
        ce.enrolled_at,
        c.course_id,
        c.name,
        c.description,
        c.tile_image_url,
        c.total_training_hours,
        c.price
      FROM CourseEnrollment ce
      JOIN Course c ON ce.course_id = c.course_id
      WHERE ce.user_id = ?
    `;
    const [rows] = await db.query(query, [userId]);
    return rows;
  }

  // Get a specific enrollment (includes course info)
  static async getEnrollmentById(enrollmentId) {
    const query = `
      SELECT 
        ce.enrollment_id,
        ce.completion_percentage,
        ce.enrolled_at,
        c.course_id,
        c.name,
        c.description,
        c.tile_image_url,
        c.total_training_hours,
        c.price
      FROM CourseEnrollment ce
      JOIN Course c ON ce.course_id = c.course_id
      WHERE ce.enrollment_id = ?
    `;
    const [rows] = await db.query(query, [enrollmentId]);
    if (rows.length === 0) return null;
    return rows[0];
  }

  static async getModulesForEnrollment(enrollmentId) {
    // 1. Find the course_id from the enrollment
    const enrollment = await LearnerDashboardModel.getEnrollmentById(
      enrollmentId
    );
    if (!enrollment) return [];

    // 2. Fetch all modules for the course, left-joining with ModuleProgress
    const query = `
      SELECT 
        cm.module_id,
        cm.module_name,
        cm.module_description,      -- <== ADD THIS
        IFNULL(mp.progress, 0) AS progress,
        IFNULL(mp.status, 'not_started') AS status
      FROM CourseModule cm
      LEFT JOIN ModuleProgress mp 
        ON cm.module_id = mp.module_id AND mp.enrollment_id = ?
      WHERE cm.course_id = ?
      ORDER BY cm.module_order ASC
    `;
    const [rows] = await db.query(query, [enrollmentId, enrollment.course_id]);
    return rows;
  }

  // Mark a module as completed (set progress to 100 and status to 'completed')
  // Mark a module as completed: update if exists; if not, insert a new record.
  static async markModuleAsCompleted(enrollmentId, moduleId) {
    // Attempt to update an existing ModuleProgress record.
    const updateQuery = `
    UPDATE ModuleProgress
    SET progress = 100, status = 'completed'
    WHERE enrollment_id = ? AND module_id = ?
  `;
    const [updateResult] = await db.query(updateQuery, [
      enrollmentId,
      moduleId,
    ]);
    if (updateResult.affectedRows > 0) {
      return true;
    }
    // If no record exists, insert a new record.
    const insertQuery = `
    INSERT INTO ModuleProgress (enrollment_id, module_id, progress, status)
    VALUES (?, ?, 100, 'completed')
  `;
    const [insertResult] = await db.query(insertQuery, [
      enrollmentId,
      moduleId,
    ]);
    return insertResult.affectedRows > 0;
  }

  static async recalculateEnrollmentCompletion(enrollmentId) {
    // Get enrollment to obtain course_id
    const enrollment = await LearnerDashboardModel.getEnrollmentById(
      enrollmentId
    );
    if (!enrollment) return false;
    const courseId = enrollment.course_id;

    // Get total number of modules for the course
    const [totalRows] = await db.query(
      `SELECT COUNT(*) AS total FROM CourseModule WHERE course_id = ?`,
      [courseId]
    );
    const totalCount = totalRows[0].total;

    // Get count of completed modules for this enrollment
    const [completedRows] = await db.query(
      `SELECT COUNT(*) AS completed FROM ModuleProgress WHERE enrollment_id = ? AND status = 'completed'`,
      [enrollmentId]
    );
    const completedCount = completedRows[0].completed;

    // Calculate new completion percentage
    const newCompletion =
      totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Update the CourseEnrollment table
    await db.query(
      `UPDATE CourseEnrollment SET completion_percentage = ? WHERE enrollment_id = ?`,
      [newCompletion, enrollmentId]
    );

    return true;
  }
}

module.exports = LearnerDashboardModel;
