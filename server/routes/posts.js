// routes/blog.js - Protected Blog Routes
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Blog Post Schema
const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [10, 'Content must be at least 10 characters long']
  },
  excerpt: {
    type: String,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  featuredImage: {
    type: String,
    default: null
  },
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Travel', 'Food', 'Lifestyle', 'Business', 'Health', 'Other']
  },
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  readTime: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorName: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Calculate read time based on content
blogPostSchema.pre('save', function(next) {
  if (this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to check if user owns the post or is admin
const requirePostOwnership = async (req, res, next) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only edit your own posts.' });
    }

    req.post = post;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUBLIC ROUTES (no authentication required)

// Get all published posts with pagination and filtering
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const search = req.query.search || '';
    const category = req.query.category || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query
    let query = { status: 'published' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    if (category && category !== 'All') {
      query.category = category;
    }

    const posts = await BlogPost.find(query)
      .populate('author', 'username firstName lastName')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .select('-comments'); // Exclude comments from list view

    const totalPosts = await BlogPost.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
});

// Get single post by ID (public)
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
      .populate('author', 'username firstName lastName profileImage bio')
      .populate('comments.author', 'username firstName lastName profileImage');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only show published posts to non-owners
    if (post.status !== 'published') {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ message: 'Server error fetching post' });
  }
});

// Get categories (public)
router.get('/categories', (req, res) => {
  const categories = ['Technology', 'Travel', 'Food', 'Lifestyle', 'Business', 'Health', 'Other'];
  res.json(categories);
});

// PROTECTED ROUTES (authentication required)

// Create new blog post
router.post('/posts', authenticateToken, upload.single('featuredImage'), async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, status } = req.body;

    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({ 
        message: 'Title, content, and category are required' 
      });
    }

    // Process tags
    let processedTags = [];
    if (tags) {
      processedTags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    // Create new post
    const newPost = new BlogPost({
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + '...',
      author: req.user.userId,
      authorName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.username,
      category,
      tags: processedTags,
      status: status || 'draft',
      featuredImage: req.file ? `/uploads/images/${req.file.filename}` : null
    });

    await newPost.save();

    // Populate author info for response
    await newPost.populate('author', 'username firstName lastName profileImage');

    res.status(201).json({
      message: 'Blog post created successfully',
      post: newPost
    });
  } catch (error) {
    console.error('Error creating post:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error creating post' });
  }
});

// Update blog post
router.put('/posts/:id', authenticateToken, requirePostOwnership, upload.single('featuredImage'), async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, status } = req.body;
    const post = req.post;

    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (excerpt) post.excerpt = excerpt;
    if (category) post.category = category;
    if (status) post.status = status;

    // Process tags
    if (tags) {
      post.tags = typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags;
    }

    // Update featured image if new one is uploaded
    if (req.file) {
      post.featuredImage = `/uploads/images/${req.file.filename}`;
    }

    await post.save();
    await post.populate('author', 'username firstName lastName profileImage');

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ message: 'Server error updating post' });
  }
});

// Delete blog post
router.delete('/posts/:id', authenticateToken, requirePostOwnership, async (req, res) => {
  try {
    const post = req.post;

    // Delete associated image file
    if (post.featuredImage) {
      const imagePath = path.join(__dirname, '..', post.featuredImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await BlogPost.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error deleting post' });
  }
});

// Get user's own posts
router.get('/my-posts', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await BlogPost.find({ author: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username firstName lastName');

    const totalPosts = await BlogPost.countDocuments({ author: req.user.userId });
    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages,
        totalPosts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
});

// Like/Unlike post
router.post('/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userLiked = post.likes.includes(req.user.userId);

    if (userLiked) {
      // Unlike
      post.likes.pull(req.user.userId);
    } else {
      // Like
      post.likes.push(req.user.userId);
    }

    await post.save();

    res.json({
      message: userLiked ? 'Post unliked' : 'Post liked',
      likes: post.likes.length,
      userLiked: !userLiked
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add comment to post
router.post('/posts/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const post = await BlogPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      author: req.user.userId,
      authorName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.username,
      content: content.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the new comment's author info
    await post.populate('comments.author', 'username firstName lastName profileImage');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1]
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server error adding comment' });
  }
});

// Delete comment
router.delete('/posts/:postId/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment or is admin
    if (comment.author.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    comment.remove();
    await post.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server error deleting comment' });
  }
});

// Serve uploaded images
router.use('/uploads', express.static('uploads'));

module.exports = router;