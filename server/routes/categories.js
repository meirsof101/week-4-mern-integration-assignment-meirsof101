const express = require('express');
const Category = require('../models/Category');
const { categoryValidation, handleValidationErrors } = require('../middleware/Validation');
const router = express.Router();

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/categories - Create a new category (with validation)
router.post('/', categoryValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = new Category({
      name,
      description
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Category already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
});

module.exports = router;