const db = require("../db");

class UserAccountModel {
  #user_id;
  #username;
  #email;
  #password_hash_;
  #first_name;
  #last_name;
  #phone_number;
  #role;
  #created_at;

  constructor({
    user_id,
    username,
    email,
    password_hash_,
    first_name,
    last_name,
    phone_number,
    role,
    created_at,
  }) {
    this.#user_id = user_id;
    this.#username = username;
    this.#email = email;
    this.#password_hash_ = password_hash_;
    this.#first_name = first_name;
    this.#last_name = last_name;
    this.#phone_number = phone_number;
    this.#role = role;
    this.#created_at = created_at;
  }

  get userId() {
    return this.#user_id;
  }
  get username() {
    return this.#username;
  }
  get email() {
    return this.#email;
  }
  get passwordHash() {
    return this.#password_hash_;
  }
  get firstName() {
    return this.#first_name;
  }
  get lastName() {
    return this.#last_name;
  }
  get phoneNumber() {
    return this.#phone_number;
  }
  get role() {
    return this.#role;
  }
  get createdAt() {
    return this.#created_at;
  }

  toJSON() {
    return {
      user_id: this.#user_id,
      username: this.#username,
      email: this.#email,
      password_hash: this.#password_hash_,
      first_name: this.#first_name,
      last_name: this.#last_name,
      phone_number: this.#phone_number,
      role: this.#role,
      created_at: this.#created_at,
    };
  }  

  static async getAll() {
    const [rows] = await db.query("SELECT * FROM UserAccount");
    return rows.map(record => new UserAccountModel(record));
  }

  static async getById(id) {
    const [rows] = await db.query("SELECT * FROM UserAccount WHERE user_id = ?", [id]);
    if (rows.length === 0) return null;
    return new UserAccountModel(rows[0]);
  }

  static async create({ username, email, password_hash_, first_name, last_name, role }) {
    const query = `
      INSERT INTO UserAccount (username, email, password_hash, first_name, last_name, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [username, email, password_hash_, first_name, last_name, role]);
    return await UserAccountModel.getById(result.insertId);
  }

  static async update(id, { username, email, first_name, last_name, role }) {
    const query = `
      UPDATE UserAccount
      SET username = ?, email = ?, first_name = ?, last_name = ?, role = ?
      WHERE user_id = ?
    `;
    const [result] = await db.query(query, [username, email, first_name, last_name, role, id]);
    if (result.affectedRows === 0) return null;
    return await UserAccountModel.getById(id);
  }

  static async delete(id) {
    const [result] = await db.query("DELETE FROM UserAccount WHERE user_id = ?", [id]);
    if (result.affectedRows === 0) return null;
    return true;
  }

  static async getByRole(role) {
    const [rows] = await db.query("SELECT * FROM UserAccount WHERE role = ?", [role]);
    return rows.map(record => new UserAccountModel(record));
  }
}

module.exports = UserAccountModel;