const ProviderProfileModel = require('../models/ProviderProfileModel');

class ProviderProfileController {
  async getAllProviderProfiles(req, res) {
    try {
      const rows = await ProviderProfileModel.getAll();
      res.json(rows);
    } catch (error) {
      console.error('Error fetching provider profiles:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getProviderProfileById(req, res) {
    try {
      const { id } = req.params;
      const profile = await ProviderProfileModel.getById(id);
      if (!profile) {
        return res.status(404).json({ error: 'Provider profile not found' });
      }
      res.json(profile);
    } catch (error) {
      console.error('Error fetching provider profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createProviderProfile(req, res) {
    try {
      const data = req.body;
      const result = await ProviderProfileModel.create(data);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating provider profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateProviderProfile(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;
      const updated = await ProviderProfileModel.update(id, data);
      if (!updated) {
        return res.status(404).json({ error: 'Provider profile not found' });
      }
      res.json({ message: 'Provider profile updated' });
    } catch (error) {
      console.error('Error updating provider profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteProviderProfile(req, res) {
    try {
      const { id } = req.params;
      const deleted = await ProviderProfileModel.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Provider profile not found' });
      }
      res.json({ message: 'Provider profile deleted' });
    } catch (error) {
      console.error('Error deleting provider profile:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new ProviderProfileController();
