const db = require("../db");

class LearnerProfileModel {
  #learner_id;
  #user_id;
  #cover_image_url;
  #profile_image_url;
  #occupation;
  #company_name;
  #about_myself;
  #created_at;

  constructor({
    learner_id,
    user_id,
    cover_image_url,
    profile_image_url,
    occupation,
    company_name,
    about_myself,
    created_at,
  }) {
    this.#learner_id = learner_id;
    this.#user_id = user_id;
    this.#cover_image_url = cover_image_url;
    this.#profile_image_url = profile_image_url;
    this.#occupation = occupation;
    this.#company_name = company_name;
    this.#about_myself = about_myself;
    this.#created_at = created_at;
  }

  get learnerId() {
    return this.#learner_id;
  }
  get userId() {
    return this.#user_id;
  }
  get coverImageUrl() {
    return this.#cover_image_url;
  }
  get profileImageUrl() {
    return this.#profile_image_url;
  }
  get occupation() {
    return this.#occupation;
  }
  get companyName() {
    return this.#company_name;
  }
  get aboutMyself() {
    return this.#about_myself;
  }
  get createdAt() {
    return this.#created_at;
  }

  toJSON() {
    return {
      learner_id: this.#learner_id,
      user_id: this.#user_id,
      cover_image_url: this.#cover_image_url,
      profile_image_url: this.#profile_image_url,
      occupation: this.#occupation,
      company_name: this.#company_name,
      about_myself: this.#about_myself,
      created_at: this.#created_at,
    };
  }  

  static async getAll() {
    const [rows] = await db.query("SELECT * FROM LearnerProfile");
    return rows.map(record => new LearnerProfileModel(record));
  }

  static async getById(id) {
    const [rows] = await db.query("SELECT * FROM LearnerProfile WHERE learner_id = ?", [id]);
    if (rows.length === 0) return null;
    return new LearnerProfileModel(rows[0]);
  }

  static async create({ user_id, cover_image_url, profile_image_url, occupation, company_name, about_myself }) {
    const query = `
      INSERT INTO LearnerProfile (user_id, cover_image_url, profile_image_url, occupation, company_name, about_myself)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [user_id, cover_image_url, profile_image_url, occupation, company_name, about_myself]);
    return await LearnerProfileModel.getById(result.insertId);
  }

  static async update(id, { user_id, cover_image_url, profile_image_url, occupation, company_name, about_myself }) {
    const query = `
      UPDATE LearnerProfile
      SET user_id = ?, cover_image_url = ?, profile_image_url = ?, occupation = ?, company_name = ?, about_myself = ?
      WHERE learner_id = ?
    `;
    const [result] = await db.query(query, [user_id, cover_image_url, profile_image_url, occupation, company_name, about_myself, id]);
    if (result.affectedRows === 0) return null;
    return await LearnerProfileModel.getById(id);
  }

  static async delete(id) {
    const [result] = await db.query("DELETE FROM LearnerProfile WHERE learner_id = ?", [id]);
    if (result.affectedRows === 0) return null;
    return true;
  }

  static async getProfileData(userId) {
    const query = `
      SELECT LP.*, UA.first_name, UA.last_name, UA.username, UA.email, UA.phone_number 
      FROM UserAccount AS UA
      INNER JOIN LearnerProfile AS LP ON UA.user_id = LP.user_id
      WHERE UA.user_id = ?
    `;
    const [rows] = await db.query(query, [userId]);
    if (rows.length === 0) return null;
    return rows[0];
  }

  static async updateAboutMyself(learner_id, about_myself) {
    const query = "UPDATE LearnerProfile SET about_myself = ? WHERE learner_id = ?";
    const [result] = await db.query(query, [about_myself, learner_id]);
    if (result.affectedRows === 0) return null;
    return true;
  }

  static async updateImage(user_id, type, filePath) {
    let query;
    if (type === "profile") {
      query = "UPDATE LearnerProfile SET profile_image_url = ? WHERE user_id = ?";
    } else if (type === "cover") {
      query = "UPDATE LearnerProfile SET cover_image_url = ? WHERE user_id = ?";
    } else {
      throw new Error('Invalid image type. Must be "profile" or "cover".');
    }
    const [result] = await db.query(query, [filePath, user_id]);
    if (result.affectedRows === 0) return null;
    return true;
  }
}

module.exports = LearnerProfileModel;