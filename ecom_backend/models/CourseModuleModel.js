const pool = require("../db");

class CourseModuleModel {
  #module_id;
  #course_id;
  #module_name;
  #module_description;
  #module_order;
  #created_at;

  constructor({ module_id, course_id, module_name, module_description, module_order, created_at }) {
    this.#module_id = module_id;
    this.#course_id = course_id;
    this.#module_name = module_name;
    this.#module_description = module_description;
    this.#module_order = module_order;
    this.#created_at = created_at;
  }

  get moduleId() {
    return this.#module_id;
  }
  get courseId() {
    return this.#course_id;
  }
  get moduleName() {
    return this.#module_name;
  }
  get moduleDescription() {
    return this.#module_description;
  }
  get moduleOrder() {
    return this.#module_order;
  }
  get createdAt() {
    return this.#created_at;
  }

  toJSON() {
    return {
      module_id: this.#module_id,
      course_id: this.#course_id,
      module_name: this.#module_name,
      module_description: this.#module_description,
      module_order: this.#module_order,
      created_at: this.#created_at,
    };
  }  

  static async getAllForCourse(courseId) {
    const query = "SELECT * FROM CourseModule WHERE course_id = ?";
    const [results] = await pool.query(query, [courseId]);
    return results.map(record => new CourseModuleModel(record));
  }

  static async getById(courseId, moduleId) {
    const query = "SELECT * FROM CourseModule WHERE course_id = ? AND module_id = ?";
    const [results] = await pool.query(query, [courseId, moduleId]);
    if (!results || results.length === 0) return null;
    return new CourseModuleModel(results[0]);
  }

  static async create(courseId, { moduleName, moduleContent }) {
    const query = "INSERT INTO CourseModule (course_id, module_name, module_description) VALUES (?, ?, ?)";
    const [results] = await pool.query(query, [courseId, moduleName, moduleContent]);

    return await CourseModuleModel.getById(courseId, results.insertId);
  }

  static async update(moduleId, { moduleName, moduleContent }) {
    const query = "UPDATE CourseModule SET module_name = ?, module_description = ? WHERE module_id = ?";
    await pool.query(query, [moduleName, moduleContent, moduleId]);
    
    const selectQuery = "SELECT * FROM CourseModule WHERE module_id = ?";
    const [results] = await pool.query(selectQuery, [moduleId]);
    if (!results || results.length === 0) return null;
    return new CourseModuleModel(results[0]);
  }

  static async delete(moduleId) {
    const query = "DELETE FROM CourseModule WHERE module_id = ?";
    await pool.query(query, [moduleId]);
    return true;
  }
}

module.exports = CourseModuleModel;