const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const database = require('../database/connection');

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

// Candidate authentication middleware
const authenticateCandidate = async (req, res, next) => {
  try {
    // Check for token in Authorization header first, then cookies
    let token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fwc-hrms-super-secret-jwt-key-2024');
    
    // Get candidate from database
    const candidate = await database.findOne('candidates', { _id: new ObjectId(decoded.candidateId) });
    
    if (!candidate || candidate.status !== 'ACTIVE') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid or inactive candidate' 
      });
    }

    req.candidateId = candidate._id;
    req.candidate = candidate;
    next();
  } catch (error) {
    console.error('Candidate token verification error:', error);
    return res.status(401).json({ 
      success: false,
      message: 'Invalid token' 
    });
  }
};

// Enhanced token verification with permissions
const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fwc-hrms-super-secret-jwt-key-2024');
    
    // Get user from database with enhanced information
    const user = await database.findOne('users', { _id: new ObjectId(decoded.userId) });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }

    // Get employee data
    const employee = await database.findOne('employees', { userId: user._id });

    // Add permissions and role level to user object
    user.permissions = ROLE_PERMISSIONS[user.role] || [];
    user.roleLevel = ROLE_HIERARCHY[user.role] || 0;
    user.employee = employee ? {
      id: employee._id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      department: employee.department,
      position: employee.position,
      employeeId: employee.employeeId,
      hireDate: employee.hireDate,
      isOnProbation: employee.isOnProbation
    } : null;

    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Enhanced role checking with hierarchy support
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userRoleLevel = ROLE_HIERARCHY[req.user.role] || 0;
    const hasPermission = allowedRoles.some(role => {
      const requiredLevel = ROLE_HIERARCHY[role] || 0;
      return userRoleLevel >= requiredLevel;
    });

    if (!hasPermission) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role,
        roleLevel: userRoleLevel
      });
    }

    next();
  };
};

// Check specific permission
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: permission,
        current: req.user.permissions
      });
    }

    next();
  };
};

// Check multiple permissions (user must have ALL)
const checkPermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const hasAllPermissions = permissions.every(permission => 
      req.user.permissions && req.user.permissions.includes(permission)
    );

    if (!hasAllPermissions) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        required: permissions,
        current: req.user.permissions
      });
    }

    next();
  };
};

// Check if user can access resource (owner or higher role)
const checkResourceAccess = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Admin and HR can access all resources
    if (req.user.role === 'ADMIN' || req.user.role === 'HR') {
      return next();
    }

    // Check if user is accessing their own resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    if (resourceUserId && resourceUserId === req.user._id.toString()) {
      return next();
    }

    // Managers can access their team members' resources
    if (req.user.role === 'MANAGER') {
      // This would need additional logic to check if the resource belongs to a team member
      // For now, we'll allow it but this should be enhanced with actual team checking
      return next();
    }

    return res.status(403).json({ 
      message: 'Access denied to this resource',
      resourceUserId,
      currentUserId: req.user._id
    });
  };
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fwc-hrms-super-secret-jwt-key-2024');
      const user = await database.findOne('users', { _id: new ObjectId(decoded.userId) });
      
      if (user && user.isActive) {
        const employee = await database.findOne('employees', { userId: user._id });
        
        user.permissions = ROLE_PERMISSIONS[user.role] || [];
        user.roleLevel = ROLE_HIERARCHY[user.role] || 0;
        user.employee = employee ? {
          id: employee._id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          department: employee.department,
          position: employee.position
        } : null;
        
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
};

// Rate limiting middleware for sensitive operations
const createRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip + (req.user?._id || 'anonymous');
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old attempts
    if (attempts.has(key)) {
      const userAttempts = attempts.get(key).filter(time => time > windowStart);
      attempts.set(key, userAttempts);
    } else {
      attempts.set(key, []);
    }

    const userAttempts = attempts.get(key);

    if (userAttempts.length >= maxAttempts) {
      return res.status(429).json({
        message: 'Too many attempts. Please try again later.',
        retryAfter: Math.ceil((userAttempts[0] + windowMs - now) / 1000)
      });
    }

    userAttempts.push(now);
    next();
  };
};

module.exports = {
  verifyToken,
  checkRole,
  checkPermission,
  checkPermissions,
  checkResourceAccess,
  optionalAuth,
  createRateLimit,
  authenticateCandidate,
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS
};