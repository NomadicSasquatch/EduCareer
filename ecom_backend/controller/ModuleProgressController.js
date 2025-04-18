const ModuleProgressModel = require('../models/ModuleProgressModel');

// Get all module progress records
exports.getAllModuleProgress = async (req, res) => {
  try {
    const rows = await ModuleProgressModel.getAllModuleProgress();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching module progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get module progress by ID
exports.getModuleProgressById = async (req, res) => {
  try {
    const { id } = req.params;
    const row = await ModuleProgressModel.getModuleProgressById(id);
    if (!row) {
      return res.status(404).json({ error: 'Module progress not found' });
    }
    res.json(row);
  } catch (error) {
    console.error('Error fetching module progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new module progress record
exports.createModuleProgress = async (req, res) => {
  try {
    const data = req.body;
    const result = await ModuleProgressModel.createModuleProgress(data);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating module progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a module progress record
exports.updateModuleProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await ModuleProgressModel.updateModuleProgress(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Module progress not found' });
    }
    res.json({ message: 'Module progress updated' });
  } catch (error) {
    console.error('Error updating module progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a module progress record
exports.deleteModuleProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ModuleProgressModel.deleteModuleProgress(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Module progress not found' });
    }
    res.json({ message: 'Module progress deleted' });
  } catch (error) {
    console.error('Error deleting module progress:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
