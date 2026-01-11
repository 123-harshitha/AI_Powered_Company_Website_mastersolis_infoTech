const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const prisma = new PrismaClient();

// Apply auth middleware to all routes
router.use(verifyToken);

// Validation schemas
const payrollCreateSchema = [
  body('employeeId').isMongoId().withMessage('Invalid employee ID'),
  body('payPeriodStart').isISO8601().withMessage('Invalid pay period start date'),
  body('payPeriodEnd').isISO8601().withMessage('Invalid pay period end date'),
  body('grossSalary').isFloat({ gt: 0 }).withMessage('Gross salary must be positive'),
  body('basicSalary').isFloat({ gt: 0 }).withMessage('Basic salary must be positive'),
  body('allowances').optional().isObject().withMessage('Allowances must be an object'),
  body('deductions').optional().isObject().withMessage('Deductions must be an object'),
  body('overtimePay').optional().isFloat({ min: 0 }).withMessage('Overtime pay must be non-negative'),
  body('bonus').optional().isFloat({ min: 0 }).withMessage('Bonus must be non-negative'),
  body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters')
];

// Get employee's own payroll records
router.get('/my-payroll', [
  query('year').isInt({ min: 2020, max: 2030 }).withMessage('Invalid year'),
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Invalid month'),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { year, month, page = 1, limit = 12 } = req.query;
  const employeeId = req.user.employee.id;

  const where = {
    employeeId
  };

  // Filter by year
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(parseInt(year) + 1, 0, 1);
  
  where.payPeriodStart = {
    gte: yearStart,
    lt: yearEnd
  };

  // Filter by month if provided
  if (month) {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 1);
    
    where.payPeriodStart = {
      gte: monthStart,
      lt: monthEnd
    };
  }

  const skip = (page - 1) * limit;

  const [payrollRecords, total] = await Promise.all([
    prisma.payroll.findMany({
      skip,
      take: limit,
      where,
      orderBy: { payPeriodStart: 'desc' },
      select: {
        id: true,
        payPeriodStart: true,
        payPeriodEnd: true,
        grossSalary: true,
        basicSalary: true,
        allowances: true,
        deductions: true,
        overtimePay: true,
        bonus: true,
        totalDeductions: true,
        netSalary: true,
        taxAmount: true,
        currency: true,
        status: true,
        paidAt: true,
        createdAt: true
      }
    }),
    prisma.payroll.count({ where })
  ]);

  // Calculate yearly summary
  const yearlyStats = await prisma.payroll.aggregate({
    where: {
      employeeId,
      payPeriodStart: {
        gte: yearStart,
        lt: yearEnd
      }
    },
    _sum: {
      grossSalary: true,
      netSalary: true,
      totalDeductions: true,
      overtimePay: true,
      bonus: true,
      taxAmount: true
    },
    _count: true
  });

  res.json({
    payrollRecords,
    yearlySummary: {
      totalRecords: yearlyStats._count,
      totalGross: yearlyStats._sum.grossSalary || 0,
      totalNet: yearlyStats._sum.netSalary || 0,
      totalDeductions: yearlyStats._sum.totalDeductions || 0,
      totalOvertime: yearlyStats._sum.overtimePay || 0,
      totalBonus: yearlyStats._sum.bonus || 0,
      totalTax: yearlyStats._sum.taxAmount || 0,
      averageMonthly: yearlyStats._count > 0 ? (yearlyStats._sum.netSalary / yearlyStats._count) : 0
    },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Admin/HR: Get all payroll records with filters
router.get('/', [
  checkRole('ADMIN', 'HR', 'MANAGER'),
  query('employeeId').optional().isMongoId().withMessage('Invalid employee ID'),
  query('departmentId').optional().isMongoId().withMessage('Invalid department ID'),
  query('year').optional().isInt({ min: 2020, max: 2030 }).withMessage('Invalid year'),
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Invalid month'),
  query('status').optional().isIn(['PROCESSING', 'APPROVED', 'PAID', 'DISPUTED']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const {
    employeeId,
    departmentId,
    year,
    month,
    status,
    page = 1,
    limit = 50
  } = req.query;

  const where = {};

  if (employeeId) {
    where.employeeId = employeeId;
  }

  if (departmentId) {
    // Get employees in department
    const departmentEmployeeIds = await prisma.employee.findMany({
      where: { departmentId },
      select: { id: true }
    });
    where.employeeId = { in: departmentEmployeeIds.map(emp => emp.id) };
  }

  if (status) {
    where.status = status;
  }

  if (year) {
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(parseInt(year) + 1, 0, 1);
    
    let startDate = yearStart;
    let endDate = yearEnd;

    if (month) {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 1);
    }

    where.payPeriodStart = {
      gte: startDate,
      lt: endDate
    };
  }

  const skip = (page - 1) * limit;

  const [payrollRecords, total] = await Promise.all([
    prisma.payroll.findMany({
      skip,
      take: limit,
      where,
      orderBy: { payPeriodStart: 'desc' },
      include: {
        employee: {
          select: {
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
      }
    }),
    prisma.payroll.count({ where })
  ]);

  // Calculate summary statistics
  const summary = await prisma.payroll.aggregate({
    where,
    _sum: {
      grossSalary: true,
      netSalary: true,
      totalDeductions: true,
      overtimePay: true,
      bonus: true,
      taxAmount: true
    },
    _count: true
  });

  res.json({
    payrollRecords,
    summary: {
      totalRecords: summary._count,
      totalGross: summary._sum.grossSalary || 0,
      totalNet: summary._sum.netSalary || 0,
      totalDeductions: summary._sum.totalDeductions || 0,
      totalOvertime: summary._sum.overtimePay || 0,
      totalBonus: summary._sum.bonus || 0,
      totalTax: summary._sum.taxAmount || 0
    },
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Create payroll record (Admin/HR only)
router.post('/', [
  checkRole('ADMIN', 'HR'),
  ...payrollCreateSchema
], asyncHandler(async: req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const payrollData = req.body;
  
  // Calculate auto-generated fields
  const totalDeductions = calculateDeductions(
    payrollData.deductions,
    payrollData.grossSalary
  );
  
  const taxAmount = calculateTax(payrollData.grossSalary);
  
  payrollData.totalDeductions = totalDeductions;
  payrollData.taxAmount = taxAmount;
  payrollData.netSalary = payrollData.grossSalary + (payrollData.overtimePay || 0) + (payrollData.bonus || 0) - totalDeductions - taxAmount;

  const payroll = await prisma.payroll.create({
    data: payrollData,
    include: {
      employee: {
        select: {
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
    }
  });

  res.status(201).json({
    message: 'Payroll record created successfully',
    payroll
  });
}));

// Process payroll for all employees (Admin only)
router.post('/process', [
  checkRole('ADMIN'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Invalid month'),
  body('year').isInt({ min: 2020, max: 2030 }).withMessage('Invalid year'),
  body('customAllowances').optional().isObject(),
  body('customDeductions').optional().isObject()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { month, year, customAllowances = {}, customDeductions = {} } = req.body;

  // Get all active employees
  const employees = await prisma.employee.findMany({
    where: {
      isActive: true,
      user: {
        isActive: true
      }
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      salary: true,
      hourlyRate: true,
      employmentType: true
    }
  });

  const payrollStart = new Date(year, month - 1, 1);
  const payrollEnd = new Date(year, month, 0);

  const payrollRecords = [];

  // Process each employee
  for (const employee of employees) {
    // Calculate basic salary for the period
    const grossSalary = employee.salary || (employee.hourlyRate * 160); // 40 hours * 4 weeks
    
    // Add custom allowances
    const allowances = {
      ...customAllowances,
      ...((employee.salary && { basic: employee.salary }) || {})
    };

    // Calculate deductions
    const deductions = {
      ...customDeductions,
      incomeTax: grossSalary * 0.1, // 10% income tax
      socialSecurity: grossSalary * 0.06 // 6% social security
    };

    const totalDeductions = calculateDeductions(deductions, grossSalary);
    const taxAmount = calculateTax(grossSalary);
    const netSalary = grossSalary - totalDeductions - taxAmount;

    const payrollRecord = await prisma.payroll.create({
      data: {
        employeeId: employee.id,
        payPeriodStart: payrollStart,
        payPeriodEnd: payrollEnd,
        grossSalary,
        basicSalary: employee.salary || 0,
        allowances,
        deductions,
        totalDeductions,
        netSalary,
        taxAmount,
        currency: 'USD',
        status: 'PROCESSING'
      }
    });

    payrollRecords.push(payrollRecord);
  }

  res.status(201).json({
    message: `Payroll processed for ${employees.length} employees`,
    processedCount: employees.length,
    payrollPeriod: `${month}/${year}`,
    totalRecords: payrollRecords.length
  });
}));

// Delete payroll record (Admin only)
router.delete('/:id', [
  checkRole('ADMIN'),
  param('id').isMongoId().withMessage('Invalid payroll ID')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { id } = req.params;

  await prisma.payroll.delete({
    where: { id }
  });

  res.json({ 
    message: 'Payroll record deleted successfully' 
  });
}));

// Helper functions
function calculateDeductions(deductions, grossSalary) {
  if (!deductions || typeof deductions !== 'object') {
    return 0;
  }
  
  return Object.values(deductions).reduce((sum, amount) => sum + (amount || 0), 0);
}

function calculateTax(grossSalary) {
  // Progressive tax calculation (simplified)
  if (grossSalary <= 10000) return grossSalary * 0.05;
  if (grossSalary <= 50000) return 500 + (grossSalary - 10000) * 0.10;
  return 4500 + (grossSalary - 50000) * 0.15;
} 

module.exports = router;
