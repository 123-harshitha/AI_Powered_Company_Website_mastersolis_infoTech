const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { ObjectId } = require('mongodb');
const database = require('../database/connection');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Get payroll records
router.get('/', checkRole('ADMIN', 'HR'), asyncHandler(async (req, res) => {
  const { month, employeeId } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};
  if (month) query.month = month;
  if (employeeId) query.employeeId = employeeId;

  const payrollRecords = await database.find('payroll', query, {
    skip,
    limit,
    sort: { month: -1, createdAt: -1 }
  });

  const total = await database.count('payroll', query);

  res.json({
    payrollRecords,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get my payroll records
router.get('/my-payroll', asyncHandler(async (req, res) => {
  const { year, month, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  // Get employee by user ID
  const employee = await database.findOne('employees', { userId: new ObjectId(req.user.userId) });
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  let query = { employeeId: employee._id.toString() };
  if (year) query.year = parseInt(year);
  if (month) query.month = parseInt(month);

  const payrollRecords = await database.find('payroll', query, {
    skip,
    limit,
    sort: { year: -1, month: -1 }
  });

  // Calculate yearly summary
  const yearlyRecords = await database.find('payroll', { 
    employeeId: employee._id.toString(),
    year: year ? parseInt(year) : new Date().getFullYear()
  });

  const yearlySummary = {
    totalEarnings: yearlyRecords.reduce((sum, record) => sum + (record.grossSalary || 0), 0),
    totalDeductions: yearlyRecords.reduce((sum, record) => sum + (record.totalDeductions || 0), 0),
    totalNetPay: yearlyRecords.reduce((sum, record) => sum + (record.netSalary || 0), 0),
    averageMonthly: yearlyRecords.length > 0 
      ? yearlyRecords.reduce((sum, record) => sum + (record.netSalary || 0), 0) / yearlyRecords.length 
      : 0
  };

  const total = await database.count('payroll', query);

  res.json({
    payrollRecords,
    yearlySummary,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Generate payroll
router.post('/generate', checkRole('ADMIN', 'HR'), [
  body('month').isNumeric().withMessage('Month must be a number'),
  body('year').isNumeric().withMessage('Year must be a number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { month, year } = req.body;

  // Get all active employees
  const employees = await database.find('employees', { isActive: true });

  const payrollRecords = [];
  
  for (const employee of employees) {
    // Mock payroll calculation
    const grossSalary = employee.salary || 50000;
    const taxRate = 0.2; // 20% tax
    const insuranceRate = 0.05; // 5% insurance
    const taxAmount = grossSalary * taxRate;
    const insuranceAmount = grossSalary * insuranceRate;
    const totalDeductions = taxAmount + insuranceAmount;
    const netSalary = grossSalary - totalDeductions;

    const payrollRecord = {
      employeeId: employee._id.toString(),
      month: parseInt(month),
      year: parseInt(year),
      grossSalary,
      taxAmount,
      insuranceAmount,
      totalDeductions,
      netSalary,
      status: 'PENDING',
      generatedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    payrollRecords.push(payrollRecord);
  }

  // Insert payroll records
  const result = await database.insertMany('payroll', payrollRecords);

  res.status(201).json({
    message: 'Payroll generated successfully',
    recordsGenerated: result.insertedCount,
    month,
    year
  });
}));

// Process payroll
router.post('/process', checkRole('ADMIN', 'HR'), [
  body('month').isNumeric().withMessage('Month must be a number'),
  body('year').isNumeric().withMessage('Year must be a number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { month, year } = req.body;

  // Update all payroll records for the month/year to processed
  const result = await database.updateMany(
    'payroll',
    { month: parseInt(month), year: parseInt(year) },
    { 
      $set: { 
        status: 'PROCESSED',
        processedAt: new Date(),
        updatedAt: new Date()
      }
    }
  );

  res.json({
    message: 'Payroll processed successfully',
    recordsProcessed: result.modifiedCount,
    month,
    year
  });
}));

// Update payroll record
router.put('/:id', checkRole('ADMIN', 'HR'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid payroll record ID' });
  }

  const updateData = {
    ...req.body,
    updatedAt: new Date()
  };

  const result = await database.updateOne(
    'payroll',
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ message: 'Payroll record not found' });
  }

  res.json({
    message: 'Payroll record updated successfully',
    payroll: { id, ...updateData }
  });
}));

// Mark payroll as paid
router.put('/:id/mark-paid', checkRole('ADMIN', 'HR'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid payroll record ID' });
  }

  const result = await database.updateOne(
    'payroll',
    { _id: new ObjectId(id) },
    { 
      $set: { 
        status: 'PAID',
        paidAt: new Date(),
        updatedAt: new Date()
      }
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ message: 'Payroll record not found' });
  }

  res.json({ message: 'Payroll marked as paid successfully' });
}));

module.exports = router;