const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const prisma = new PrismaClient();

// Role hierarchy and permissions
const ROLE_HIERARCHY = {
  ADMIN: 5,
  HR: 4,
  MANAGER: 3,
  EMPLOYEE: 2,
  CANDIDATE: 1
};

const ROLE_PERMISSIONS = {
  ADMIN: [
    'users.create', 'users.read', 'users.update', 'users.delete',
    'employees.create', 'employees.read', 'employees.update', 'employees.delete',
    'departments.create', 'departments.read', 'departments.update', 'departments.delete',
    'attendance.read', 'attendance.update', 'attendance.delete',
    'leave.read', 'leave.approve', 'leave.reject',
    'payroll.create', 'payroll.read', 'payroll.update', 'payroll.delete',
    'performance.create', 'performance.read', 'performance.update', 'performance.delete',
    'recruitment.create', 'recruitment.read', 'recruitment.update', 'recruitment.delete',
    'reports.read', 'analytics.read', 'settings.read', 'settings.update'
  ],
  HR: [
    'employees.create', 'employees.read', 'employees.update',
    'departments.read',
    'attendance.read', 'attendance.update',
    'leave.read', 'leave.approve', 'leave.reject',
    'payroll.create', 'payroll.read', 'payroll.update',
    'performance.create', 'performance.read', 'performance.update',
    'recruitment.create', 'recruitment.read', 'recruitment.update', 'recruitment.delete',
    'reports.read', 'analytics.read'
  ],
  MANAGER: [
    'employees.read',
    'departments.read',
    'attendance.read', 'attendance.update',
    'leave.read', 'leave.approve', 'leave.reject',
    'performance.create', 'performance.read', 'performance.update',
    'reports.read'
  ],
  EMPLOYEE: [
    'attendance.read', 'attendance.create',
    'leave.read', 'leave.create',
    'performance.read'
  ],
  CANDIDATE: [
    'profile.read', 'profile.update'
  ]
};

// Generate tokens with enhanced role information
const generateTokens = (userId, role, permissions) => {
  const token = jwt.sign(
    { 
      userId, 
      role, 
      permissions,
      roleLevel: ROLE_HIERARCHY[role] || 0
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
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

// Enhanced register with role validation
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('firstName').notEmpty().withMessage('First name required'),
  body('lastName').notEmpty().withMessage('Last name required'),
  body('role').optional().isIn(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE', 'CANDIDATE']).withMessage('Invalid role'),
  body('departmentId').optional().isMongoId().withMessage('Invalid department ID'),
  body('position').optional().isLength({ max: 100 }).withMessage('Position too long'),
  body('employeeId').optional().isLength({ max: 20 }).withMessage('Employee ID too long')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { 
    email, 
    username, 
    password, 
    firstName, 
    lastName, 
    role = 'EMPLOYEE', 
    departmentId,
    position,
    employeeId
  } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ]
    }
  });

  if (existingUser) {
    return res.status(400).json({ 
      message: 'User already exists',
      field: existingUser.email === email ? 'email' : 'username'
    });
  }

  // Validate role assignment permissions
  if (role === 'ADMIN' || role === 'HR') {
    // Only existing admins can create admin/HR accounts
    const requestingUser = req.user;
    if (!requestingUser || requestingUser.role !== 'ADMIN') {
      return res.status(403).json({ 
        message: 'Insufficient permissions to create admin/HR accounts' 
      });
    }
  }

  // Hash password
  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  // Create user and employee in transaction
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: role.toUpperCase(),
        isActive: true
      }
    });

    // Create employee record for non-candidate roles
    let employee = null;
    if (role !== 'CANDIDATE') {
      employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeId,
          firstName,
          lastName,
          position,
          departmentId,
          hireDate: new Date(),
          isActive: true,
          isOnProbation: role === 'EMPLOYEE' // New employees start on probation
        }
      });
    }

    return { user, employee };
  });

  // Generate tokens with permissions
  const permissions = ROLE_PERMISSIONS[role] || [];
  const { token, refreshToken } = generateTokens(result.user.id, result.user.role, permissions);

  // Set cookies
  res.cookie('token', token, getCookieOptions());
  res.cookie('refreshToken', refreshToken, getCookieOptions(true));

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      id: result.user.id,
      email: result.user.email,
      username: result.user.username,
      role: result.user.role,
      permissions,
      employee: result.employee ? {
        id: result.employee.id,
        firstName: result.employee.firstName,
        lastName: result.employee.lastName,
        position: result.employee.position,
        departmentId: result.employee.departmentId
      } : null
    }
  });
}));

// Enhanced login with role-based response
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

  // Find user with employee data
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      employee: {
        include: {
          department: {
            select: {
              id: true,
              name: true,
              location: true
            }
          }
        }
      }
    }
  });

  if (!user) {
    return res.status(401).json({ 
      message: 'Invalid credentials' 
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({ 
      message: 'Account is deactivated. Please contact administrator.' 
    });
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ 
      message: 'Invalid credentials' 
    });
  }

  // Generate tokens with permissions
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  const { token, refreshToken } = generateTokens(user.id, user.role, permissions);

  // Set cookies
  res.cookie('token', token, getCookieOptions());
  res.cookie('refreshToken', refreshToken, getCookieOptions(true));

  // Log successful login
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'LOGIN',
      entity: 'USER',
      entityId: user.id,
      details: JSON.stringify({
        email: user.email,
        role: user.role,
        timestamp: new Date().toISOString()
      }),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      permissions,
      employee: user.employee ? {
        id: user.employee.id,
        firstName: user.employee.firstName,
        lastName: user.employee.lastName,
        position: user.employee.position,
        department: user.employee.department,
        employeeId: user.employee.employeeId,
        hireDate: user.employee.hireDate,
        isOnProbation: user.employee.isOnProbation
      } : null
    }
  });
}));

// Get current user with enhanced information
router.get('/me', asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Not authenticated' 
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: {
      employee: {
        include: {
          department: {
            select: {
              id: true,
              name: true,
              location: true
            }
          },
          supervisor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              position: true
            }
          }
        }
      }
    }
  });

  if (!user) {
    return res.status(404).json({ 
      message: 'User not found' 
    });
  }

  const permissions = ROLE_PERMISSIONS[user.role] || [];

  res.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      permissions,
      employee: user.employee ? {
        id: user.employee.id,
        firstName: user.employee.firstName,
        lastName: user.employee.lastName,
        position: user.employee.position,
        department: user.employee.department,
        supervisor: user.employee.supervisor,
        employeeId: user.employee.employeeId,
        hireDate: user.employee.hireDate,
        isOnProbation: user.employee.isOnProbation,
        salary: user.employee.salary,
        workLocation: user.employee.workLocation
      } : null
    }
  });
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ 
      message: 'Refresh token not provided' 
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ 
        message: 'Invalid refresh token' 
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        message: 'User not found or inactive' 
      });
    }

    const permissions = ROLE_PERMISSIONS[user.role] || [];
    const { token, refreshToken: newRefreshToken } = generateTokens(user.id, user.role, permissions);

    res.cookie('token', token, getCookieOptions());
    res.cookie('refreshToken', newRefreshToken, getCookieOptions(true));

    res.json({
      message: 'Token refreshed successfully',
      user: {
        id: user.id,
        role: user.role,
        permissions
      }
    });
  } catch (error) {
    return res.status(401).json({ 
      message: 'Invalid refresh token' 
    });
  }
}));

// Logout
router.post('/logout', asyncHandler(async (req, res) => {
  // Log logout action
  if (req.user) {
    await prisma.auditLog.create({
      data: {
        userId: req.user.userId,
        action: 'LOGOUT',
        entity: 'USER',
        entityId: req.user.userId,
        details: JSON.stringify({
          timestamp: new Date().toISOString()
        }),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });
  }

  res.clearCookie('token');
  res.clearCookie('refreshToken');
  
  res.json({ 
    message: 'Logout successful' 
  });
}));

// Change password
router.post('/change-password', [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  if (!req.user) {
    return res.status(401).json({ 
      message: 'Not authenticated' 
    });
  }

  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, password: true }
  });

  if (!user) {
    return res.status(404).json({ 
      message: 'User not found' 
    });
  }

  const isValidPassword = await bcrypt.compare(currentPassword, user.password);
  if (!isValidPassword) {
    return res.status(400).json({ 
      message: 'Current password is incorrect' 
    });
  }

  const saltRounds = 12;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNewPassword }
  });

  // Log password change
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: 'PASSWORD_CHANGE',
      entity: 'USER',
      entityId: user.id,
      details: JSON.stringify({
        timestamp: new Date().toISOString()
      }),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    }
  });

  res.json({ 
    message: 'Password changed successfully' 
  });
}));

// Get role permissions
router.get('/permissions', asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Not authenticated' 
    });
  }

  const permissions = ROLE_PERMISSIONS[req.user.role] || [];
  const roleLevel = ROLE_HIERARCHY[req.user.role] || 0;

  res.json({
    role: req.user.role,
    permissions,
    roleLevel,
    hierarchy: ROLE_HIERARCHY
  });
}));

// Admin: Get all users with roles
router.get('/users', asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ 
      message: 'Admin access required' 
    });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          position: true,
          department: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    users: users.map(user => ({
      ...user,
      permissions: ROLE_PERMISSIONS[user.role] || [],
      roleLevel: ROLE_HIERARCHY[user.role] || 0
    }))
  });
}));

module.exports = router;
