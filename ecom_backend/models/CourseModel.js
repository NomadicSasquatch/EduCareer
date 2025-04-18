const pool = require("../db");

class CourseModel {
  #course_id;
  #creator_id;
  #name;
  #description;
  #price;
  #max_capacity;
  #category;
  #created_at;
  #source;
  #external_reference_number;
  #training_provider_alias;
  #total_training_hours;
  #total_cost;
  #tile_image_url;
  #enrollmentCount;

  constructor({
    course_id,
    creator_id,
    name,
    description,
    price,
    max_capacity,
    category,
    created_at,
    source,
    external_reference_number,
    training_provider_alias,
    total_training_hours,
    total_cost,
    tile_image_url,
    enrollmentCount,
  }) {
    this.#course_id = course_id;
    this.#creator_id = creator_id;
    this.#name = name;
    this.#description = description;
    this.#price = price;
    this.#max_capacity = max_capacity;
    this.#category = category;
    this.#created_at = created_at;
    this.#source = source;
    this.#external_reference_number = external_reference_number;
    this.#training_provider_alias = training_provider_alias;
    this.#total_training_hours = total_training_hours;
    this.#total_cost = total_cost;
    this.#tile_image_url = tile_image_url;
    this.#enrollmentCount = enrollmentCount !== undefined ? enrollmentCount : 0;
  }

  get courseId() {
    return this.#course_id;
  }
  get creatorId() {
    return this.#creator_id;
  }
  get name() {
    return this.#name;
  }
  get description() {
    return this.#description;
  }
  get price() {
    return this.#price;
  }
  get maxCapacity() {
    return this.#max_capacity;
  }
  get category() {
    return this.#category;
  }
  get createdAt() {
    return this.#created_at;
  }
  get source() {
    return this.#source;
  }
  get externalReferenceNumber() {
    return this.#external_reference_number;
  }
  get trainingProviderAlias() {
    return this.#training_provider_alias;
  }
  get totalTrainingHours() {
    return this.#total_training_hours;
  }
  get totalCost() {
    return this.#total_cost;
  }
  get tileImageUrl() {
    return this.#tile_image_url;
  }
  get enrollmentCount() {
    return this.#enrollmentCount;
  }

  toJSON() {
    return {
      course_id: this.#course_id,
      creator_id: this.#creator_id,
      name: this.#name,
      description: this.#description,
      price: this.#price,
      max_capacity: this.#max_capacity,
      category: this.#category,
      created_at: this.#created_at,
      source: this.#source,
      external_reference_number: this.#external_reference_number,
      training_provider_alias: this.#training_provider_alias,
      total_training_hours: this.#total_training_hours,
      total_cost: this.#total_cost,
      tile_image_url: this.#tile_image_url,
      enrollmentCount: this.#enrollmentCount,
    };
  }

  static async getAll(keyword) {
    let query = "SELECT * FROM course";
    const queryParams = [];
    if (keyword && keyword.trim() !== "") {
      query += " WHERE name LIKE ? OR description LIKE ?";
      queryParams.push(`%${keyword}%`, `%${keyword}%`);
    }
    const [results] = await pool.query(query, queryParams);
    console.log(results);
    return results.map(record => new CourseModel(record));
  }

  static async getById(courseId) {
    const courseQuery = "SELECT * FROM Course WHERE course_id = ?";
    const enrollmentQuery =
      "SELECT COUNT(*) AS count FROM CourseEnrollment WHERE course_id = ?";
    
    const [courseResults] = await pool.query(courseQuery, [courseId]);
    if (courseResults.length === 0) return null;
    
    const [enrollmentResults] = await pool.query(enrollmentQuery, [courseId]);
    const enrollmentCount = enrollmentResults[0].count;

    return new CourseModel({ ...courseResults[0], enrollmentCount });
  }

  static async create(data) {
    const {
      creator_id,
      name,
      description,
      price,
      max_capacity,
      category,
      source,
      external_reference_number,
      training_provider_alias,
      total_training_hours,
      total_cost,
      tile_image_url,
    } = data;
    
    const query = `
      INSERT INTO course 
      (creator_id, name, description, price, max_capacity, category, source, external_reference_number, training_provider_alias, total_training_hours, total_cost, tile_image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      creator_id,
      name,
      description,
      price,
      max_capacity,
      category,
      source,
      external_reference_number,
      training_provider_alias,
      total_training_hours,
      total_cost,
      tile_image_url,
    ];
    const [result] = await pool.query(query, values);
    return await CourseModel.getById(result.insertId);
  }

  static async update(courseId, data) {
    const {
      name,
      description,
      price,
      max_capacity,
      category,
      source,
      external_reference_number,
      training_provider_alias,
      total_training_hours,
      total_cost,
      tile_image_url,
    } = data;
    
    const query = `
      UPDATE course 
      SET name = ?, description = ?, price = ?, max_capacity = ?, category = ?, source = ?, external_reference_number = ?, training_provider_alias = ?, total_training_hours = ?, total_cost = ?, tile_image_url = ?
      WHERE course_id = ?
    `;
    const values = [
      name,
      description,
      price,
      max_capacity,
      category,
      source,
      external_reference_number,
      training_provider_alias,
      total_training_hours,
      total_cost,
      tile_image_url,
      courseId,
    ];
    await pool.query(query, values);
    return await CourseModel.getById(courseId);
  }

  static async delete(courseId, creator_id) {
    const query = "DELETE FROM course WHERE course_id = ? AND creator_id = ?";
    const [result] = await pool.query(query, [courseId, creator_id]);
    return result.affectedRows > 0;
  }

  static async getProviderCourses(creator_id) {
    const query = "SELECT * FROM course WHERE creator_id = ?";
    const [results] = await pool.query(query, [creator_id]);
    return results.map(record => new CourseModel(record));
  }

  static async getEnrolledStudentsForCourse(courseId) {
    const query = `
      SELECT 
        ce.enrollment_id, 
        ce.completion_percentage, 
        ce.is_kicked, 
        ce.enrolled_at,
        u.user_id, 
        u.username, 
        u.email, 
        u.first_name, 
        u.last_name,
        lp.cover_image_url, 
        lp.profile_image_url, 
        lp.occupation, 
        lp.company_name
      FROM CourseEnrollment ce
      JOIN UserAccount u ON ce.user_id = u.user_id
      LEFT JOIN LearnerProfile lp ON u.user_id = lp.user_id
      WHERE ce.course_id = ?
    `;
    const [rows] = await pool.query(query, [courseId]);
    return rows;
  }

  static async getEnrolledStudentsForProvider(creator_id) {
    const query = `
      SELECT 
        ce.enrollment_id,
        ce.course_id,
        ce.completion_percentage,
        ce.is_kicked,
        ce.enrolled_at,
        u.user_id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        lp.cover_image_url,
        lp.profile_image_url,
        lp.occupation,
        lp.company_name,
        c.name AS course_name
      FROM CourseEnrollment ce
      JOIN Course c ON ce.course_id = c.course_id
      JOIN UserAccount u ON ce.user_id = u.user_id
      LEFT JOIN LearnerProfile lp ON u.user_id = lp.user_id
      WHERE c.creator_id = ?
      ORDER BY ce.enrolled_at DESC
    `;
    const [rows] = await pool.query(query, [creator_id]);
    return rows;
  }

  static async addModule(data) {
    const { course_id, module_name, module_description, module_order } = data;
    if (!course_id || !module_name || !module_order) {
      throw new Error("course_id, module_name, and module_order are required");
    }
    const query = `
      INSERT INTO CourseModule (course_id, module_name, module_description, module_order)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      course_id,
      module_name,
      module_description,
      module_order,
    ]);
    return { module_id: result.insertId };
  }

  static async getModules(course_id) {
    const query = "SELECT * FROM CourseModule WHERE course_id = ?";
    const [rows] = await pool.query(query, [course_id]);
    return rows;
  }

  static async updateModule(module_id, data) {
    const { course_id, module_name, module_description, module_order } = data;
    const query = `
      UPDATE CourseModule 
      SET module_name = ?, module_description = ?, module_order = ?
      WHERE module_id = ? AND course_id = ?
    `;
    const [result] = await pool.query(query, [
      module_name,
      module_description,
      module_order,
      module_id,
      course_id,
    ]);
    return result.affectedRows > 0;
  }
}

module.exports = CourseModel;