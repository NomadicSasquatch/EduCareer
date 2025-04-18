const db = require('../db');

// Get all provider profiles
exports.getAllProviderProfiles = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ProviderProfile');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching provider profiles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a provider profile by ID
exports.getProviderProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM ProviderProfile WHERE provider_id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching provider profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new provider profile
exports.createProviderProfile = async (req, res) => {
  try {
    const { user_id, lecture_team_id, organization_name, phone_number, address } = req.body;
    const [result] = await db.query(
      `INSERT INTO ProviderProfile (user_id, lecture_team_id, organization_name, phone_number, address)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, lecture_team_id, organization_name, phone_number, address]
    );
    res.status(201).json({ provider_id: result.insertId });
  } catch (error) {
    console.error('Error creating provider profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a provider profile
exports.updateProviderProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, lecture_team_id, organization_name, phone_number, address } = req.body;
    const [result] = await db.query(
      `UPDATE ProviderProfile
       SET user_id = ?, lecture_team_id = ?, organization_name = ?, phone_number = ?, address = ?
       WHERE provider_id = ?`,
      [user_id, lecture_team_id, organization_name, phone_number, address, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }
    res.json({ message: 'Provider profile updated' });
  } catch (error) {
    console.error('Error updating provider profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a provider profile
exports.deleteProviderProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM ProviderProfile WHERE provider_id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Provider profile not found' });
    }
    res.json({ message: 'Provider profile deleted' });
  } catch (error) {
    console.error('Error deleting provider profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};