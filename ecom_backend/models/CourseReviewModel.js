const pool = require("../db");

class CourseReviewModel {
  #review_id;
  #user_id;
  #course_id;
  #externalReferenceNumber;
  #rating;
  #comment;
  #created_at;
  #user_name;

  constructor({
    review_id,
    user_id,
    course_id,
    externalReferenceNumber,
    rating,
    comment,
    created_at,
    user_name,
  }) {
    this.#review_id = review_id;
    this.#user_id = user_id;
    this.#course_id = course_id;
    this.#externalReferenceNumber = externalReferenceNumber;
    this.#rating = rating;
    this.#comment = comment;
    this.#created_at = created_at;
    this.#user_name = user_name;
  }

  get reviewId() {
    return this.#review_id;
  }
  get userId() {
    return this.#user_id;
  }
  get courseId() {
    return this.#course_id;
  }
  get externalReferenceNumber() {
    return this.#externalReferenceNumber;
  }
  get rating() {
    return this.#rating;
  }
  get comment() {
    return this.#comment;
  }
  get createdAt() {
    return this.#created_at;
  }
  get userName() {
    return this.#user_name;
  }

  toJSON() {
    return {
      review_id: this.#review_id,
      user_id: this.#user_id,
      course_id: this.#course_id,
      externalReferenceNumber: this.#externalReferenceNumber,
      rating: this.#rating,
      comment: this.#comment,
      created_at: this.#created_at,
      user_name: this.#user_name,
    };
  }
  
  static async getReviews({ courseId, externalReferenceNumber }) {
    let query, params;
    if (externalReferenceNumber) {
      query =
        'SELECT r.*, u.username as user_name FROM CourseReview r LEFT JOIN UserAccount u ON r.user_id = u.user_id WHERE r.externalReferenceNumber = ?';
      params = [externalReferenceNumber];
    } else {
      query =
        'SELECT r.*, u.username as user_name FROM CourseReview r LEFT JOIN UserAccount u ON r.user_id = u.user_id WHERE r.course_id = ?';
      params = [courseId];
    }
    const [results] = await pool.query(query, params);
    return results.map(record => new CourseReviewModel(record));
  }

  static async getById(reviewId) {
    const query = "SELECT * FROM CourseReview WHERE review_id = ?";
    const [results] = await pool.query(query, [reviewId]);
    return results.length ? new CourseReviewModel(results[0]) : null;
  }

  static async createReview({ courseId, userId, rating, comment, externalReferenceNumber }) {
    const query =
      'INSERT INTO CourseReview (course_id, user_id, externalReferenceNumber, rating, comment) VALUES (?, ?, ?, ?, ?)';
    const [result] = await pool.query(query, [
      courseId || null,
      userId,
      externalReferenceNumber || null,
      rating,
      comment,
    ]);
    return await CourseReviewModel.getById(result.insertId);
  }

  static async updateReview(reviewId, { rating, comment }) {
    const query = "UPDATE CourseReview SET rating = ?, comment = ? WHERE review_id = ?";
    await pool.query(query, [rating, comment, reviewId]);
    return await CourseReviewModel.getById(reviewId);
  }

  static async deleteReview(reviewId) {
    const query = "DELETE FROM CourseReview WHERE review_id = ?";
    await pool.query(query, [reviewId]);
    return true;
  }
}

module.exports = CourseReviewModel;