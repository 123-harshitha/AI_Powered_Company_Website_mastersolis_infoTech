const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { ObjectId } = require('mongodb');
const database = require('../database/connection');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Get attendance report
router.get('/attendance', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const { startDate, endDate, departmentId, employeeId } = req.query;
  
  let query = {};
  if (startDate && endDate) {
    query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  if (departmentId) query.departmentId = departmentId;
  if (employeeId) query.employeeId = employeeId;

  const attendanceRecords = await database.find('attendance', query, {
    sort: { date: -1 }
  });

  // Calculate statistics
  const stats = {
    totalRecords: attendanceRecords.length,
    presentDays: attendanceRecords.filter(r => r.status === 'PRESENT').length,
    absentDays: attendanceRecords.filter(r => r.status === 'ABSENT').length,
    lateDays: attendanceRecords.filter(r => r.status === 'LATE').length,
    totalHours: attendanceRecords.reduce((sum, r) => sum + (r.hoursWorked || 0), 0)
  };

  res.json({
    attendanceRecords,
    stats,
    dateRange: { startDate, endDate }
  });
}));

// Get payroll report
router.get('/payroll', checkRole('ADMIN', 'HR'), asyncHandler(async (req, res) => {
  const { month, year, departmentId } = req.query;
  
  let query = {};
  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    query.payPeriod = { $gte: startDate, $lte: endDate };
  }
  if (departmentId) query.departmentId = departmentId;

  const payrollRecords = await database.find('payroll', query, {
    sort: { payPeriod: -1 }
  });

  // Calculate statistics
  const stats = {
    totalRecords: payrollRecords.length,
    totalGrossPay: payrollRecords.reduce((sum, r) => sum + (r.grossPay || 0), 0),
    totalNetPay: payrollRecords.reduce((sum, r) => sum + (r.netPay || 0), 0),
    totalTaxes: payrollRecords.reduce((sum, r) => sum + (r.taxes || 0), 0),
    averageGrossPay: payrollRecords.length > 0 ? 
      payrollRecords.reduce((sum, r) => sum + (r.grossPay || 0), 0) / payrollRecords.length : 0
  };

  res.json({
    payrollRecords,
    stats,
    period: { month, year }
  });
}));

// Get leave report
router.get('/leave', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const { startDate, endDate, departmentId, status } = req.query;
  
  let query = {};
  if (startDate && endDate) {
    query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  if (departmentId) query.departmentId = departmentId;
  if (status) query.status = status;

  const leaveRequests = await database.find('leave_requests', query, {
    sort: { startDate: -1 }
  });

  // Calculate statistics
  const stats = {
    totalRequests: leaveRequests.length,
    approvedRequests: leaveRequests.filter(r => r.status === 'APPROVED').length,
    pendingRequests: leaveRequests.filter(r => r.status === 'PENDING').length,
    rejectedRequests: leaveRequests.filter(r => r.status === 'REJECTED').length,
    totalDays: leaveRequests.reduce((sum, r) => sum + (r.daysRequested || 0), 0)
  };

  res.json({
    leaveRequests,
    stats,
    dateRange: { startDate, endDate }
  });
}));

// Get performance report
router.get('/performance', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const { year, departmentId, reviewType } = req.query;
  
  let query = {};
  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    query.reviewDate = { $gte: startDate, $lte: endDate };
  }
  if (departmentId) query.departmentId = departmentId;
  if (reviewType) query.reviewType = reviewType;

  const performanceReviews = await database.find('performance_reviews', query, {
    sort: { reviewDate: -1 }
  });

  // Calculate statistics
  const stats = {
    totalReviews: performanceReviews.length,
    averageRating: performanceReviews.length > 0 ? 
      performanceReviews.reduce((sum, r) => sum + (r.overallRating || 0), 0) / performanceReviews.length : 0,
    highPerformers: performanceReviews.filter(r => (r.overallRating || 0) >= 4).length,
    needsImprovement: performanceReviews.filter(r => (r.overallRating || 0) < 3).length
  };

  res.json({
    performanceReviews,
    stats,
    period: { year }
  });
}));

// Get general analytics
router.get('/analytics', checkRole('ADMIN', 'HR'), asyncHandler(async (req, res) => {
  const { period } = req.query;
  
  // Calculate date range based on period
  let startDate, endDate;
  const now = new Date();
  
  switch (period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      endDate = now;
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = now;
      break;
    case 'quarter':
      startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      endDate = now;
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = now;
      break;
    default:
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = now;
  }

  // Get various statistics
  const [employees, attendance, leaveRequests, payroll] = await Promise.all([
    database.find('employees', { isActive: true }),
    database.find('attendance', { date: { $gte: startDate, $lte: endDate } }),
    database.find('leave_requests', { startDate: { $gte: startDate, $lte: endDate } }),
    database.find('payroll', { payPeriod: { $gte: startDate, $lte: endDate } })
  ]);

  const analytics = {
    employees: {
      total: employees.length,
      byDepartment: employees.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
      }, {})
    },
    attendance: {
      totalRecords: attendance.length,
      averageHours: attendance.length > 0 ? 
        attendance.reduce((sum, r) => sum + (r.hoursWorked || 0), 0) / attendance.length : 0,
      attendanceRate: attendance.length > 0 ? 
        (attendance.filter(r => r.status === 'PRESENT').length / attendance.length) * 100 : 0
    },
    leave: {
      totalRequests: leaveRequests.length,
      approvalRate: leaveRequests.length > 0 ? 
        (leaveRequests.filter(r => r.status === 'APPROVED').length / leaveRequests.length) * 100 : 0
    },
    payroll: {
      totalPaid: payroll.reduce((sum, r) => sum + (r.netPay || 0), 0),
      averagePay: payroll.length > 0 ? 
        payroll.reduce((sum, r) => sum + (r.grossPay || 0), 0) / payroll.length : 0
    }
  };

  res.json({
    analytics,
    period: { startDate, endDate },
    generatedAt: new Date()
  });
}));

// Export report
router.get('/:type/export', checkRole('ADMIN', 'HR'), asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { format = 'pdf', dateRange } = req.query;
  
  // For now, return a mock export response
  // In a real system, you would generate actual PDF/Excel files
  res.json({
    message: `Exporting ${type} report in ${format} format`,
    downloadUrl: `/api/files/exports/${type}_${Date.now()}.${format}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  });
}));

module.exports = router;

