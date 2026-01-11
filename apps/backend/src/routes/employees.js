const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { ObjectId } = require('mongodb');
const database = require('../database/connection');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Get all employees (Admin/HR only)
router.get('/', checkRole('ADMIN', 'HR'), asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Get employees with user data
  const employees = await database.find('employees', {}, {
    skip,
    limit,
    sort: { createdAt: -1 }
  });

  // Get user data for each employee
  const employeesWithUsers = await Promise.all(
    employees.map(async (employee) => {
      const user = await database.findOne('users', { _id: employee.userId });
      return {
        ...employee,
        user: user ? {
          id: user._id,
          email: user.email,
          username: user.username,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt
        } : null
      };
    })
  );

  const total = await database.count('employees');

  res.json({
    employees: employeesWithUsers,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get employee by ID (can be user ID or employee ID)
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  // First try to find by employee ID
  let employee = await database.findOne('employees', { _id: new ObjectId(id) });
  
  // If not found, try to find by user ID
  if (!employee) {
    employee = await database.findOne('employees', { userId: new ObjectId(id) });
  }
  
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  // Get user data
  const user = await database.findOne('users', { _id: employee.userId });
  
  // Get department data if exists
  let department = null;
  if (employee.department) {
    department = await database.findOne('departments', { name: employee.department });
  }

  res.json({
    employee: {
      ...employee,
      user: user ? {
        id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive
      } : null,
      department
    }
  });
}));

// Create new employee
router.post('/', checkRole('ADMIN', 'HR'), [
  body('firstName').notEmpty().withMessage('First name required'),
  body('lastName').notEmpty().withMessage('Last name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('position').notEmpty().withMessage('Position required'),
  body('department').optional().isString(),
  body('salary').optional().isNumeric().withMessage('Salary must be a number'),
  body('employmentType').optional().isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'FREELANCE'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { firstName, lastName, email, position, department, salary, employmentType = 'FULL_TIME' } = req.body;

  // Check if user already exists
  const existingUser = await database.findOne('users', { email });
  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  // Create user account
  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash('password123', 12); // Default password
  
  const userData = {
    email,
    username: email.split('@')[0],
    password: hashedPassword,
    role: 'EMPLOYEE',
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
    position,
    department: department || null,
    salary: salary || null,
    employmentType,
    hireDate: new Date(),
    isActive: true,
    isOnProbation: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const employeeResult = await database.insertOne('employees', employeeData);

  res.status(201).json({
    message: 'Employee created successfully',
    employee: {
      id: employeeResult.insertedId,
      firstName,
      lastName,
      email,
      position,
      department,
      salary,
      employmentType
    }
  });
}));

// Update employee
router.put('/:id', checkRole('ADMIN', 'HR'), [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('position').optional().notEmpty(),
  body('department').optional().isString(),
  body('salary').optional().isNumeric(),
  body('employmentType').optional().isIn(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'FREELANCE'])
], asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid employee ID' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const updateData = {
    ...req.body,
    updatedAt: new Date()
  };

  const result = await database.updateOne(
    'employees',
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  res.json({
    message: 'Employee updated successfully',
    employee: { id, ...updateData }
  });
}));

// Delete employee (soft delete)
router.delete('/:id', checkRole('ADMIN'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid employee ID' });
  }

  // Soft delete - mark as inactive
  const result = await database.updateOne(
    'employees',
    { _id: new ObjectId(id) },
    { 
      $set: { 
        isActive: false,
        terminationDate: new Date(),
        updatedAt: new Date()
      }
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  // Also deactivate user account
  const employee = await database.findOne('employees', { _id: new ObjectId(id) });
  if (employee) {
    await database.updateOne(
      'users',
      { _id: employee.userId },
      { 
        $set: { 
          isActive: false,
          updatedAt: new Date()
        }
      }
    );
  }

  res.json({ message: 'Employee deactivated successfully' });
}));

// Get employee statistics
router.get('/stats/overview', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const totalEmployees = await database.count('employees', { isActive: true });
  const totalDepartments = await database.count('departments', { isActive: true });
  
  // Get employees by department
  const employeesByDept = await database.find('employees', { isActive: true });
  const deptStats = {};
  
  employeesByDept.forEach(emp => {
    const dept = emp.department || 'Unassigned';
    deptStats[dept] = (deptStats[dept] || 0) + 1;
  });

  res.json({
    data: {
      totalEmployees,
      totalDepartments,
      employeesByDepartment: deptStats,
      activeEmployees: totalEmployees
    }
  });
}));

// Get HR analytics
router.get('/analytics/hr', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const totalEmployees = await database.count('employees', { isActive: true });
  const totalDepartments = await database.count('departments', { isActive: true });
  
  // Calculate retention rate (simplified)
  const retentionRate = 85; // Mock data
  
  // Get department analytics
  const departments = await database.find('departments', { isActive: true });
  const departmentAnalytics = await Promise.all(
    departments.map(async (dept) => {
      const employeeCount = await database.count('employees', { 
        department: dept.name, 
        isActive: true 
      });
      
      return {
        id: dept._id,
        name: dept.name,
        employeeCount,
        avgPerformance: Math.floor(Math.random() * 30) + 70, // Mock data
        retentionRate: Math.floor(Math.random() * 20) + 80, // Mock data
        openPositions: Math.floor(Math.random() * 3) // Mock data
      };
    })
  );

  res.json({
    analytics: {
      retentionRate,
      departments: departmentAnalytics
    }
  });
}));

// Get recruitment stats
router.get('/analytics/recruitment', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const openPositions = await database.count('job_postings', { status: 'PUBLISHED' });
  const totalCandidates = await database.count('candidates');
  
  // Mock new hires for this month
  const newHires = Math.floor(Math.random() * 5) + 1;

  res.json({
    recruitment: {
      openPositions,
      totalCandidates,
      newHires
    }
  });
}));

// Get team members for a manager
router.get('/team/:managerId', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const { managerId } = req.params;
  
  // For now, return all employees as team members
  // In a real system, you'd have a manager-employee relationship
  const employees = await database.find('employees', { isActive: true });
  
  const teamMembers = await Promise.all(
    employees.map(async (employee) => {
      const user = await database.findOne('users', { _id: employee.userId });
      return {
        id: employee._id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: employee.position,
        department: employee.department,
        email: user?.email,
        isActive: employee.isActive
      };
    })
  );

  res.json(teamMembers);
}));

// Get performance data for an employee
router.get('/:id/performance', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid employee ID' });
  }

  // Get performance reviews for this employee
  const reviews = await database.find('performance_reviews', { employeeId: id });
  
  // Calculate average performance
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.overallRating, 0) / reviews.length 
    : 0;

  res.json({
    reviews,
    averageRating: avgRating,
    totalReviews: reviews.length
  });
}));

module.exports = router;