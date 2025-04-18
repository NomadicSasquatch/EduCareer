const pool = require("../db");
const { verifyHashedPassword, hashingPassword } = require("../services/PasswordService");

class UserAuthModel {
  static async getUserByUsernameOrEmail(identifier) {
    const sql = `
      SELECT * FROM UserAccount
      WHERE username = ? OR email = ?
      LIMIT 1
    `;
    const [rows] = await pool.query(sql, [identifier, identifier]);
    return rows.length ? rows[0] : null;
  }

  static async insertUserSessionHistory(userId, sessionId) {
    const sql = "INSERT INTO user_sessions (user_id, session_id) VALUES (?, ?)";
    const [result] = await pool.query(sql, [userId, sessionId]);
    return result;
  }

  static async createUserAccount({ username, email, password_hash, first_name, last_name, phone_number, role }) {
    const userSql = `
      INSERT INTO UserAccount
        (username, email, first_name, last_name, phone_number, password_hash, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [userResult] = await pool.query(userSql, [username, email, first_name, last_name, phone_number, password_hash, role]);
    return userResult.insertId;
  }

  static async createProviderProfile(newUserId, { lecture_team_id, organization_name, phone_number, address }) {
    const providerSql = `
      INSERT INTO ProviderProfile
        (user_id, organization_name, phone_number, address)
      VALUES (?, ?, ?, ?)
    `;
    await pool.query(providerSql, [newUserId, lecture_team_id, organization_name, phone_number, address]);
  }

  static async createLearnerProfile(newUserId, { cover_image_url, profile_image_url, occupation, company_name, about_myself }) {
    const learnerSql = `
      INSERT INTO LearnerProfile
        (user_id, cover_image_url, profile_image_url, occupation, company_name, about_myself)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await pool.query(learnerSql, [newUserId, cover_image_url, profile_image_url, occupation, company_name, about_myself]);
  }

  static async updateUserPassword(userId, newPasswordHash) {
    const updateSql = "UPDATE UserAccount SET password_hash = ? WHERE user_id = ?";
    await pool.query(updateSql, [newPasswordHash, userId]);
  }
}

module.exports = UserAuthModel;