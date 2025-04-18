const UserAuthModel = require("../models/AuthenticationModel");
const {
  sendForgotPasswordEmail,
  sendRegistrationVerificationEmail,
} = require("../services/GmailService");
const {
  generateRandomPassword,
  hashingPassword,
  verifyHashedPassword,
} = require("../services/PasswordService");

class UserAuthController {
  async loginUser(req, res) {
    const { username, password, rememberMe = false } = req.body;
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }
    try {
      const user = await UserAuthModel.getUserByUsernameOrEmail(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const passwordMatch = await verifyHashedPassword(
        password,
        user.password_hash
      );
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      req.session.user = {
        id: user.user_id,
        username: user.username,
        role: user.role,
      };
      req.session.cookie.maxAge = rememberMe
        ? 14 * 24 * 60 * 60 * 1000
        : 24 * 60 * 60 * 1000;

      req.session.save(async (err) => {
        if (err) {
          console.error("Failed to save session:", err);
          return res.status(500).json({ error: "Failed to save session" });
        }
        try {
          await UserAuthModel.insertUserSessionHistory(
            user.user_id,
            req.sessionID
          );
          return res
            .status(200)
            .json({ message: "Login successful", user: req.session.user });
        } catch (error) {
          console.error("Failed to associate session with user:", error);
          return res
            .status(500)
            .json({ error: "Failed to associate session with user" });
        }
      });
    } catch (err) {
      console.error("Database query failed:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
  }

  async registerUser(req, res) {
    const {
      username,
      password,
      email,
      role,
      firstName,
      lastName,
      phone_number = "",
      lecture_team_id = null,
      organization_name = "",
      address = "",
      cover_image_url = "",
      profile_image_url = "",
      occupation = "",
      company_name = "",
      about_myself = "",
    } = req.body;

    // console.log(req.body);
    // console.log(firstName);
    // console.log(lastName);
    // return 0;

    if (!username || !password || !email) {
      return res
        .status(400)
        .json({ error: "username, password, and email are required" });
    }
    try {
      const hashedPassword = await hashingPassword(password);
      const newUserId = await UserAuthModel.createUserAccount({
        username,
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        phone_number,
        role,
      });
      if (!newUserId) {
        return res.status(500).json({ error: "Failed to insert user" });
      }
      if (role === "provider") {
        await UserAuthModel.createProviderProfile(newUserId, {
          lecture_team_id,
          organization_name,
          phone_number,
          address,
        });
      } else if (role === "learner") {
        await UserAuthModel.createLearnerProfile(newUserId, {
          cover_image_url,
          profile_image_url,
          occupation,
          company_name,
          about_myself,
        });
      }
      const emailResponse = await sendRegistrationVerificationEmail(
        email,
        username
      );
      return res.status(201).json({
        message: "Registration successful! Verification email sent.",
        userId: newUserId,
        emailResponse,
      });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        let errorMessage = "Duplicate entry.";
        if (err.sqlMessage.includes("username")) {
          errorMessage = "Username already exists.";
        } else if (err.sqlMessage.includes("email")) {
          errorMessage = "Email already exists.";
        }
        return res.status(409).json({ error: errorMessage });
      }
      console.error("Error in registerUser:", err);
      return res.status(500).json({ error: "Database query failed" });
    }
  }

  async forgotPassword(req, res) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    try {
      const user = await UserAuthModel.getUserByUsernameOrEmail(email);
      if (!user) {
        return res.status(404).json({ error: "Email not found" });
      }
      const newPassword = generateRandomPassword();
      const hashedNewPassword = await hashingPassword(newPassword);
      await UserAuthModel.updateUserPassword(user.user_id, hashedNewPassword);
      const emailResponse = await sendForgotPasswordEmail(
        email,
        user.username,
        newPassword
      );
      if (!emailResponse) {
        return res.status(500).json({ error: "Failed to send email" });
      }
      return res.status(200).json({
        message: "A new temporary password has been sent to your email.",
      });
    } catch (err) {
      console.error("Error in forgotPassword:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async resetPassword(req, res) {
    const { email, currentPassword, newPassword } = req.body;
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Email, current password, and new password are required.",
      });
    }
    try {
      const user = await UserAuthModel.getUserByUsernameOrEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
      const passwordMatch = await verifyHashedPassword(
        currentPassword,
        user.password_hash
      );
      if (!passwordMatch) {
        return res
          .status(401)
          .json({ error: "Current password is incorrect." });
      }
      const hashedNewPassword = await hashingPassword(newPassword);
      await UserAuthModel.updateUserPassword(user.user_id, hashedNewPassword);
      return res
        .status(200)
        .json({ message: "Password has been reset successfully." });
    } catch (err) {
      console.error("Error in resetPassword:", err);
      return res.status(500).json({ error: "Internal server error." });
    }
  }

  checkSession(req, res) {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ error: "No active session" });
    }
    res.status(200).json({
      message: "Session active",
      user: req.session.user,
    });
  }

  logoutUser(req, res) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Failed to destroy session:", err);
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.clearCookie("sessionCookie", { path: "/" });
      return res.status(200).json({ message: "Logout successful" });
    });
  }

  async verifyEmail(req, res) {
    try {
      const { token } = req.query;
      if (!token) {
        return res
          .status(400)
          .json({ error: "Verification token is required" });
      }
      if (token !== "dummy-token") {
        return res.status(400).json({ error: "Invalid or expired token" });
      }
      return res
        .status(200)
        .json({ message: "Email verified successfully. You can now log in." });
    } catch (error) {
      console.error("Error during email verification:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = {
  loginUser: (req, res) => new UserAuthController().loginUser(req, res),
  registerUser: (req, res) => new UserAuthController().registerUser(req, res),
  forgotPassword: (req, res) =>
    new UserAuthController().forgotPassword(req, res),
  resetPassword: (req, res) => new UserAuthController().resetPassword(req, res),
  checkSession: (req, res) => new UserAuthController().checkSession(req, res),
  logoutUser: (req, res) => new UserAuthController().logoutUser(req, res),
  verifyEmail: (req, res) => new UserAuthController().verifyEmail(req, res),
};
