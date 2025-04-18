const pool = require("../db");
const { sendEnrollmentReceipt } = require("../services/GmailService");

class EnrollmentModel {
  #enrollment_id;
  #user_id;
  #course_id;
  #completion_percentage;
  #is_kicked;
  #enrolled_at;

  constructor({ enrollment_id, user_id, course_id, completion_percentage, is_kicked, enrolled_at }) {
    this.#enrollment_id = enrollment_id;
    this.#user_id = user_id;
    this.#course_id = course_id;
    this.#completion_percentage = completion_percentage;
    this.#is_kicked = is_kicked;
    this.#enrolled_at = enrolled_at;
  }

  get enrollmentId() {
    return this.#enrollment_id;
  }
  get userId() {
    return this.#user_id;
  }
  get courseId() {
    return this.#course_id;
  }
  get completionPercentage() {
    return this.#completion_percentage;
  }
  get isKicked() {
    return this.#is_kicked;
  }
  get enrolledAt() {
    return this.#enrolled_at;
  }
  
  toJSON() {
    return {
      enrollment_id: this.#enrollment_id,
      user_id: this.#user_id,
      course_id: this.#course_id,
      completion_percentage: this.#completion_percentage,
      is_kicked: this.#is_kicked,
      enrolled_at: this.#enrolled_at,
    };
  }
  

  static async getAll() {
    const query = "SELECT * FROM CourseEnrollment";
    const [results] = await pool.query(query);
    return results.map(record => new EnrollmentModel(record));
  }

  static async getById(enrollmentId) {
    const query = "SELECT * FROM CourseEnrollment WHERE enrollment_id = ?";
    const [results] = await pool.query(query, [enrollmentId]);
    if (!results || results.length === 0) return null;
    return new EnrollmentModel(results[0]);
  }

  static async checkUserEnrollment(courseId, userId) {
    const query =
      "SELECT enrollment_id FROM CourseEnrollment WHERE course_id = ? AND user_id = ?";
    const [results] = await pool.query(query, [courseId, userId]);
    return results && results.length > 0;
  }

  static async create({ user_id, course_id, completion_percentage, is_kicked }) {
    const insertQuery = `
      INSERT INTO CourseEnrollment (user_id, course_id, completion_percentage, is_kicked)
      VALUES (?, ?, ?, ?)
    `;
    const [results] = await pool.query(insertQuery, [
      user_id,
      course_id,
      completion_percentage || 0.0,
      is_kicked || 0
    ]);

    const [courseDetails] = await pool.query("SELECT * FROM Course WHERE course_id = ?", [course_id]);
    const [userDetails] = await pool.query("SELECT * FROM UserAccount WHERE user_id = ?", [user_id]);

    if (courseDetails.length > 0 && userDetails.length > 0 && userDetails[0].email) {
      sendEnrollmentReceipt(
        userDetails[0].email,
        userDetails[0].username,
        courseDetails[0]
      ).catch((err) => console.error("Error sending receipt:", err));
    }

    return EnrollmentModel.getById(results.insertId);
  }

  static async update(enrollmentId, { completion_percentage, is_kicked }) {
    const query = `
      UPDATE CourseEnrollment 
      SET completion_percentage = ?, is_kicked = ?
      WHERE enrollment_id = ?
    `;
    await pool.query(query, [completion_percentage, is_kicked, enrollmentId]);
    return EnrollmentModel.getById(enrollmentId);
  }

  static async delete(enrollmentId) {
    const query = "DELETE FROM CourseEnrollment WHERE enrollment_id = ?";
    await pool.query(query, [enrollmentId]);
    return true;
  }
}

module.exports = EnrollmentModel;