const db = require('../db');

class ModuleProgressModel {
  #progress_id;
  #enrollment_id;
  #module_id;
  #progress;
  #status;

  constructor({ progress_id, enrollment_id, module_id, progress, status }) {
    this.#progress_id = progress_id;
    this.#enrollment_id = enrollment_id;
    this.#module_id = module_id;
    this.#progress = progress;
    this.#status = status;
  }

  get progressId() {
    return this.#progress_id;
  }

  get enrollmentId() {
    return this.#enrollment_id;
  }

  get moduleId() {
    return this.#module_id;
  }

  get progress() {
    return this.#progress;
  }

  get status() {
    return this.#status;
  }

  toJSON() {
    return {
      progress_id: this.#progress_id,
      enrollment_id: this.#enrollment_id,
      module_id: this.#module_id,
      progress: this.#progress,
      status: this.#status,
    };
  }

  static async getAllModuleProgress() {
    const [rows] = await db.query('SELECT * FROM ModuleProgress');
    return rows.map(row => new ModuleProgressModel(row));
  }

  static async getModuleProgressById(id) {
    const [rows] = await db.query('SELECT * FROM ModuleProgress WHERE progress_id = ?', [id]);
    return rows.length ? new ModuleProgressModel(rows[0]) : null;
  }

  static async createModuleProgress({ enrollment_id, module_id, progress, status }) {
    const [result] = await db.query(
      `INSERT INTO ModuleProgress (enrollment_id, module_id, progress, status)
       VALUES (?, ?, ?, ?)`,
      [enrollment_id, module_id, progress, status]
    );
    return await ModuleProgressModel.getModuleProgressById(result.insertId);
  }

  static async updateModuleProgress(id, { enrollment_id, module_id, progress, status }) {
    const [result] = await db.query(
      `UPDATE ModuleProgress
       SET enrollment_id = ?, module_id = ?, progress = ?, status = ?
       WHERE progress_id = ?`,
      [enrollment_id, module_id, progress, status, id]
    );
    return result.affectedRows > 0;
  }

  static async deleteModuleProgress(id) {
    const [result] = await db.query('DELETE FROM ModuleProgress WHERE progress_id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = ModuleProgressModel;
