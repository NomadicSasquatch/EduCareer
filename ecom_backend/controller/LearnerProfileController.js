const LearnerProfileModel = require("../models/LearnerProfileModel");

class LearnerProfileController {
  async getAllLearnerProfiles(req, res) {
    try {
      const profiles = await LearnerProfileModel.getAll();
      res.status(200).json(profiles);
    } catch (error) {
      console.error("Error fetching learner profiles:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getLearnerProfileById(req, res) {
    try {
      const { id } = req.params;
      const profile = await LearnerProfileModel.getById(id);
      if (!profile) {
        return res.status(404).json({ error: "Learner profile not found" });
      }
      res.status(200).json(profile);
    } catch (error) {
      console.error("Error fetching learner profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async createLearnerProfile(req, res) {
    try {
      const profileData = req.body;
      const result = await LearnerProfileModel.create(profileData);
      res.status(201).json({ learner_id: result.learner_id });
    } catch (error) {
      console.error("Error creating learner profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateLearnerProfile(req, res) {
    try {
      const { id } = req.params;
      const profileData = req.body;
      const updated = await LearnerProfileModel.update(id, profileData);
      if (!updated) {
        return res.status(404).json({ error: "Learner profile not found" });
      }
      res.status(200).json({ message: "Learner profile updated" });
    } catch (error) {
      console.error("Error updating learner profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async deleteLearnerProfile(req, res) {
    try {
      const { id } = req.params;
      const deleted = await LearnerProfileModel.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: "Learner profile not found" });
      }
      res.status(200).json({ message: "Learner profile deleted" });
    } catch (error) {
      console.error("Error deleting learner profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getLearnerProfileData(req, res) {
    try {
      const { id } = req.params;
      const profileData = await LearnerProfileModel.getProfileData(id);
      if (!profileData) {
        return res.status(404).json({ error: "Learner profile data not found" });
      }
      res.status(200).json(profileData);
    } catch (error) {
      console.error("Error fetching learner profile data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async updateAboutMyself(req, res) {
    try {
      const { learner_id, about_myself } = req.body;
      if (!learner_id || typeof about_myself === "undefined") {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const updated = await LearnerProfileModel.updateAboutMyself(learner_id, about_myself);
      if (!updated) {
        return res.status(404).json({ error: "Learner profile not found" });
      }
      res.status(200).json({ message: "About Myself updated successfully" });
    } catch (error) {
      console.error("Error updating About Myself:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async uploadImage(req, res) {
    try {
      const { user_id, type } = req.body;
      if (!req.file || !user_id || !type) {
        return res.status(400).json({ error: "Missing file or required fields (user_id, type)." });
      }
      // Normalize file path by replacing backslashes with forward slashes
      const filePath = req.file.path.replace(/\\/g, "/");
      const updated = await LearnerProfileModel.updateImage(user_id, type, filePath);
      if (!updated) {
        return res.status(404).json({ error: "User not found or no changes made." });
      }
      res.status(200).json({ message: "Image uploaded successfully", filePath });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

module.exports = new LearnerProfileController();