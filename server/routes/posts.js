const express = require('express');
const Post = require('../models/Post');
const Category = require('../models/Category');
const { postValidation, handleValidationErrors } = require('../middleware/Validation');
const router = express.Router();

// GET /api/posts - Get all blog posts
router.get('/', async (req, res) => {
  try {
        const { page = 1, limit = 10, category, status } = req.query;

        const query = {}; // don't filter unless asked

        if (status) query.status = status;
        if (category) query.category = category;
  


    const posts = await Post.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/posts/:id - Get a specific blog post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('category', 'name slug');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// POST /api/posts - Create a new blog post (with validation)
router.post('/', postValidation, handleValidationErrors, async (req, res) => {
  try {
    const { title, content, category, author, status, tags, featuredImage } = req.body;

    // Debug log to see what we're receiving
    console.log('Received tags:', tags, 'Type:', typeof tags);

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    let slug = generateSlug(title);

    // Ensure slug uniqueness
    let slugExists = await Post.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(title)}-${counter}`;
      slugExists = await Post.findOne({ slug });
      counter++;
    }

    // Process tags - handle both string and array formats
    let processedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        // If tags is already an array, filter and clean it
        processedTags = [...new Set(tags.map(tag => tag.trim()).filter(tag => tag.length > 0))];
      } else if (typeof tags === 'string') {
        // If tags is a string, split it and clean
        processedTags = [...new Set(tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0))];
      }
    }

    const post = new Post({
      title: title.trim(),
      slug,
      content,
      category,
      author,
      status: status || 'draft',
      tags: processedTags,
      featuredImage
    });

    const savedPost = await post.save();
    const populatedPost = await Post.findById(savedPost._id).populate('category', 'name slug');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/posts/:id - Update an existing blog post (with validation)
router.put('/:id', postValidation, handleValidationErrors, async (req, res) => {
  try {
    const { title, content, category, author, status, tags, featuredImage } = req.body;

    // Check if category exists
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ message: 'Invalid category' });
      }
    }

    const updateData = {
      title,
      content,
      category,
      author,
      status,
      featuredImage
    };

    // Process tags - handle both string and array formats
    if (tags) {
      if (Array.isArray(tags)) {
        updateData.tags = tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else if (typeof tags === 'string') {
        updateData.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      }
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/posts/:id - Delete a blog post
router.delete('/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;