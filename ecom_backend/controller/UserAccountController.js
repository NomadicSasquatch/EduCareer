const UserAccountModel = require("../models/UserAccountModel");
const {
  sendRegistrationVerificationEmail,
} = require("../services/GmailService");
const { hashingPassword } = require("../services/PasswordService");

class UserAccountController {
  async getAllUserAccounts(req, res) {
    try {
      const accounts = await UserAccountModel.getAll();
      res.status(200).json(accounts);
    } catch (error) {
      console.error("Error fetching user accounts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getUserAccountById(req, res) {
    try {
      const { id } = req.params;
      const account = await UserAccountModel.getById(id);
      if (!account) {
        return res.status(404).json({ error: "User account not found" });
      }
      res.status(200).json(account);
    } catch (error) {
      console.error("Error fetching user account:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createUserAccount(req, res) {
    try {
      const { username, email, password_hash, first_name, last_name, role } =
        req.body;
      const password_hash_ = await hashingPassword(password_hash);
      const result = await UserAccountModel.create({
        username,
        email,
        password_hash_,
        first_name,
        last_name,
        role,
      });
      // Send verification email after creating the account
      await sendRegistrationVerificationEmail(email, first_name || username);
      res.status(201).json({ user_id: result.user_id });
    } catch (error) {
      console.error("Error creating user account:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateUserAccount(req, res) {
    try {
      const { id } = req.params;
      const { username, email, first_name, last_name, role } = req.body;
      const updated = await UserAccountModel.update(id, {
        username,
        email,
        first_name,
        last_name,
        role,
      });
      if (!updated) {
        return res.status(404).json({ error: "User account not found" });
      }
      res.status(200).json({ message: "User account updated" });
    } catch (error) {
      console.error("Error updating user account:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteUserAccount(req, res) {
    try {
      const { id } = req.params;
      const deleted = await UserAccountModel.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: "User account not found" });
      }
      res.status(200).json({ message: "User account deleted" });
    } catch (error) {
      console.error("Error deleting user account:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getAdminAccounts(req, res) {
    try {
      const admins = await UserAccountModel.getByRole("admin");
      res.status(200).json(admins);
    } catch (error) {
      console.error("Error fetching admin accounts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new UserAccountController();
