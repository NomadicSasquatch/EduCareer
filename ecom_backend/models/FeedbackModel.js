const pool = require('../db');

class FeedbackModel {
  #feedback_id;
  #user_id;
  #name;
  #email;
  #subject;
  #message;
  #created_at;

  constructor({ feedback_id, user_id, name, email, subject, message, created_at }) {
    this.#feedback_id = feedback_id;
    this.#user_id = user_id;
    this.#name = name;
    this.#email = email;
    this.#subject = subject;
    this.#message = message;
    this.#created_at = created_at;
  }

  get feedbackId() {
    return this.#feedback_id;
  }
  get userId() {
    return this.#user_id;
  }
  get name() {
    return this.#name;
  }
  get email() {
    return this.#email;
  }
  get subject() {
    return this.#subject;
  }
  get message() {
    return this.#message;
  }
  get createdAt() {
    return this.#created_at;
  }

  toJSON() {
    return {
      feedback_id: this.#feedback_id,
      user_id: this.#user_id,
      name: this.#name,
      email: this.#email,
      subject: this.#subject,
      message: this.#message,
      created_at: this.#created_at,
    };
  }  

  static async getAll() {
    const query = 'SELECT * FROM ContactUsFeedback';
    const [results] = await pool.query(query);
    return results.map(record => new FeedbackModel(record));
  }

  static async getById(feedbackId) {
    const query = 'SELECT * FROM ContactUsFeedback WHERE feedback_id = ?';
    const [results] = await pool.query(query, [feedbackId]);
    if (!results || results.length === 0) return null;
    return new FeedbackModel(results[0]);
  }

  static async create({ user_id, name, email, subject, message }) {
    const query = `
      INSERT INTO ContactUsFeedback (user_id, name, email, subject, message)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [user_id || null, name, email, subject, message]);
    return FeedbackModel.getById(result.insertId);
  }

  static async update(feedbackId, { user_id, name, email, subject, message }) {
    const query = `
      UPDATE ContactUsFeedback 
      SET user_id = ?, name = ?, email = ?, subject = ?, message = ? 
      WHERE feedback_id = ?
    `;
    await pool.query(query, [user_id || null, name, email, subject, message, feedbackId]);
    return FeedbackModel.getById(feedbackId);
  }

  static async delete(feedbackId) {
    const query = 'DELETE FROM ContactUsFeedback WHERE feedback_id = ?';
    await pool.query(query, [feedbackId]);
    return true;
  }
}

module.exports = FeedbackModel;
