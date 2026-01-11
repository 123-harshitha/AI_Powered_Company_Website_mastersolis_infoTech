const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');
const database = require('../database/connection');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Generate tokens
const generateTokens = (userId, role) => {
  const token = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'fwc-hrms-super-secret-jwt-key-2024',
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'fwc-hrms-super-secret-refresh-key-2024',
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { token, refreshToken };
};

// Set cookie options
const getCookieOptions = (isRefresh = false) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: isRefresh 
    ? (parseInt(process.env.JWT_REFRESH_EXPIRES_IN?.replace('d', '')) || 7) * 24 * 60 * 60 * 1000
    : (parseInt(process.env.JWT_EXPIRES_IN?.replace('m', '')) || 15) * 60 * 1000
});

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').notEmpty().withMessage('First name required'),
  body('lastName').notEmpty().withMessage('Last name required'),
  body('role').optional().isIn(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE', 'CANDIDATE']).withMessage('Invalid role')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { email, username, password, firstName, lastName, role = 'EMPLOYEE', department, position } = req.body;

  // Check if user already exists
  const existingUser = await database.findOne('users', {
    $or: [
      { email },
      { username }
    ]
  });

  if (existingUser) {
    return res.status(400).json({ 
      message: 'User already exists',
      field: existingUser.email === email ? 'email' : 'username'
    });
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user
  const userData = {
    email,
    username,
    password: hashedPassword,
    role: role.toUpperCase(),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const userResult = await database.insertOne('users', userData);
  const userId = userResult.insertedId;

  // Create employee record
  const employeeData = {
    userId: userId,
    firstName,
    lastName,
    position: position || 'Employee',
    department: department || null,
    hireDate: new Date(),
    isActive: true,
    isOnProbation: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await database.insertOne('employees', employeeData);

  // Generate tokens
  const { token, refreshToken } = generateTokens(userId.toString(), role.toUpperCase());

  // Set cookies
  res.cookie('token', token, getCookieOptions());
  res.cookie('refreshToken', refreshToken, getCookieOptions(true));

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: userId,
      email,
      username,
      role: role.toUpperCase(),
      firstName,
      lastName
    },
    token,
    refreshToken
  });
}));

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  // Find user
  const user = await database.findOne('users', { email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({ message: 'Account is deactivated' });
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Get employee data
  const employee = await database.findOne('employees', { userId: user._id });

  // Generate tokens
  const { token, refreshToken } = generateTokens(user._id.toString(), user.role);

  // Set cookies
  res.cookie('token', token, getCookieOptions());
  res.cookie('refreshToken', refreshToken, getCookieOptions(true));

  res.json({
    message: 'Login successful',
    user: {
      id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      firstName: employee?.firstName,
      lastName: employee?.lastName,
      position: employee?.position,
      department: employee?.department
    },
    token,
    refreshToken
  });
}));

// Logout
router.post('/logout', asyncHandler(async (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logout successful' });
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fwc-hrms-super-secret-refresh-key-2024');
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Find user
    const user = await database.findOne('users', { _id: new ObjectId(decoded.userId) });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    // Generate new tokens
    const { token, refreshToken: newRefreshToken } = generateTokens(user._id.toString(), user.role);

    // Set new cookies
    res.cookie('token', token, getCookieOptions());
    res.cookie('refreshToken', newRefreshToken, getCookieOptions(true));

    res.json({
      message: 'Token refreshed successfully',
      token,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
}));

// Get current user
router.get('/me', asyncHandler(async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fwc-hrms-super-secret-jwt-key-2024');
    
    const user = await database.findOne('users', { _id: new ObjectId(decoded.userId) });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'User not found or inactive' });
    }

    const employee = await database.findOne('employees', { userId: user._id });

    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        firstName: employee?.firstName,
        lastName: employee?.lastName,
        position: employee?.position,
        department: employee?.department
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
}));

module.exports = router;