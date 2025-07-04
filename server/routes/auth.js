// routes/auth.js - Enhanced with debugging
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Add request logging middleware
router.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// User Registration
router.post('/register', async (req, res) => {
  try {
    console.log('Registration attempt with data:', req.body);
    
    const { username, email, password, firstName, lastName } = req.body;

    // Detailed field validation with specific error messages
    const missingFields = [];
    if (!username) missingFields.push('username');
    if (!email) missingFields.push('email');
    if (!password) missingFields.push('password');
    if (!firstName) missingFields.push('firstName');
    if (!lastName) missingFields.push('lastName');

    if (missingFields.length > 0) {
      console.log('Missing fields:', missingFields);
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields
      });
    }

    // Additional validation
    if (typeof username !== 'string' || username.trim().length === 0) {
      console.log('Invalid username:', username);
      return res.status(400).json({ message: 'Username must be a non-empty string' });
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      console.log('Invalid email:', email);
      return res.status(400).json({ message: 'Valid email address is required' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      console.log('Invalid password length:', password?.length);
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists
    console.log('Checking for existing user...');
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      console.log('User already exists:', existingUser.email, existingUser.username);
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    // Hash password
    console.log('Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    console.log('Creating new user...');
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      firstName,
      lastName
    });

    const savedUser = await newUser.save();
    console.log('User created successfully:', savedUser._id);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: savedUser._id, 
        username: savedUser.username, 
        email: savedUser.email,
        role: savedUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        fullName: savedUser.fullName
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.log('Validation errors:', messages);
      return res.status(400).json({ 
        message: messages.join(', '),
        validationErrors: error.errors
      });
    }
    
    if (error.code === 11000) {
      console.log('Duplicate key error:', error.keyValue);
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// User Login
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt with data:', req.body);
    
    const { identifier, password } = req.body;

    // Detailed validation
    if (!identifier) {
      console.log('Missing identifier');
      return res.status(400).json({ 
        message: 'Email or username is required',
        field: 'identifier'
      });
    }

    if (!password) {
      console.log('Missing password');
      return res.status(400).json({ 
        message: 'Password is required',
        field: 'password'
      });
    }

    if (typeof identifier !== 'string' || typeof password !== 'string') {
      console.log('Invalid data types - identifier:', typeof identifier, 'password:', typeof password);
      return res.status(400).json({ 
        message: 'Invalid data format' 
      });
    }

    // Find user by email or username
    console.log('Searching for user with identifier:', identifier);
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { username: identifier }
      ]
    });

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', user.username, user.email);

    // Check if account is active
    if (!user.isActive) {
      console.log('Account is deactivated');
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Verify password
    console.log('Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('Password verified successfully');

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    console.log('Login successful for user:', user.username);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        fullName: user.fullName,
        profileImage: user.profileImage,
        bio: user.bio
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        fullName: user.fullName,
        profileImage: user.profileImage,
        bio: user.bio,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update User Profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, bio } = req.body;
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        fullName: user.fullName,
        profileImage: user.profileImage,
        bio: user.bio
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Change Password
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'New password must be at least 6 characters long' 
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error changing password' });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Export middleware for use in other routes
module.exports = router;
module.exports.authenticateToken = authenticateToken;
module.exports.requireAdmin = requireAdmin;