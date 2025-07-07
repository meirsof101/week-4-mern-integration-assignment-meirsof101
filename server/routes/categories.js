const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Category schema (adjust based on your actual schema)
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

// POST /api/categories - Create a new category (optional)
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    const category = new Category({ name, description });
    await category.save();
    
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
});

module.exports = router;