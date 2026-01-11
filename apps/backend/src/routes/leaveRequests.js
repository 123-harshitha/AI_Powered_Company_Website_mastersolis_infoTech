const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { ObjectId } = require('mongodb');
const database = require('../database/connection');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Get leave requests
router.get('/', asyncHandler(async (req, res) => {
  const { employeeId, status } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};
  if (employeeId) query.employeeId = employeeId;
  if (status) query.status = status;

  const leaveRequests = await database.find('leave_requests', query, {
    skip,
    limit,
    sort: { createdAt: -1 }
  });

  const total = await database.count('leave_requests', query);

  res.json({
    leaveRequests,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get my leave requests
router.get('/my-leaves', asyncHandler(async (req, res) => {
  const { year, status, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  // Get employee by user ID
  const employee = await database.findOne('employees', { userId: new ObjectId(req.user.userId) });
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  let query = { employeeId: employee._id.toString() };
  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    query.startDate = { $gte: startDate, $lte: endDate };
  }
  if (status) query.status = status;

  const leaveRequests = await database.find('leave_requests', query, {
    skip,
    limit,
    sort: { createdAt: -1 }
  });

  // Calculate leave balance (mock data)
  const leaveBalance = {
    VACATION: 20,
    SICK: 10,
    PERSONAL: 5,
    MATERNITY: 90,
    PATERNITY: 30
  };

  const total = await database.count('leave_requests', query);

  res.json({
    leaveRequests,
    leaveBalance,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get pending leave requests
router.get('/pending', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const { departmentId, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  let query = { status: 'PENDING' };
  if (departmentId) {
    // Get employees in this department
    const employees = await database.find('employees', { department: departmentId });
    const employeeIds = employees.map(emp => emp._id.toString());
    query.employeeId = { $in: employeeIds };
  }

  const leaveRequests = await database.find('leave_requests', query, {
    skip,
    limit,
    sort: { createdAt: -1 }
  });

  // Get employee details for each request
  const requestsWithEmployees = await Promise.all(
    leaveRequests.map(async (request) => {
      const employee = await database.findOne('employees', { _id: new ObjectId(request.employeeId) });
      return {
        ...request,
        employee: employee ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          position: employee.position,
          department: employee.department
        } : null
      };
    })
  );

  const total = await database.count('leave_requests', query);

  res.json({
    leaveRequests: requestsWithEmployees,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Create leave request
router.post('/', asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { leaveType, startDate, endDate, reason, workCoverage, isEmergency } = req.body;

  // Get employee by user ID
  const employee = await database.findOne('employees', { userId: new ObjectId(req.user.userId) });
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  // Calculate days requested
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysRequested = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const leaveRequest = {
    employeeId: employee._id.toString(),
    leaveType,
    startDate: start,
    endDate: end,
    daysRequested,
    reason: reason || '',
    workCoverage: workCoverage || '',
    isEmergency: isEmergency || false,
    status: 'PENDING',
    requestedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await database.insertOne('leave_requests', leaveRequest);

  res.status(201).json({
    message: 'Leave request submitted successfully',
    leaveRequest: {
      id: result.insertedId,
      ...leaveRequest
    }
  });
}));

// Approve/Reject leave request
router.put('/:id/approve', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action, rejectionReason } = req.body;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid leave request ID' });
  }

  if (!['APPROVED', 'REJECTED'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action. Must be APPROVED or REJECTED' });
  }

  const updateData = {
    status: action,
    reviewedAt: new Date(),
    reviewedBy: req.user.userId,
    updatedAt: new Date()
  };

  if (action === 'REJECTED' && rejectionReason) {
    updateData.rejectionReason = rejectionReason;
  }

  const result = await database.updateOne(
    'leave_requests',
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ message: 'Leave request not found' });
  }

  res.json({
    message: `Leave request ${action.toLowerCase()} successfully`,
    status: action
  });
}));

// Get pending leave requests
router.get('/pending', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const { departmentId, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  let query = { status: 'PENDING' };
  if (departmentId) {
    // Filter by department if provided
    const employees = await database.find('employees', { department: departmentId });
    const employeeIds = employees.map(emp => emp._id.toString());
    query.employeeId = { $in: employeeIds };
  }

  const leaveRequests = await database.find('leave_requests', query, {
    skip,
    limit,
    sort: { createdAt: -1 }
  });

  // Get employee details for each request
  const requestsWithEmployees = await Promise.all(
    leaveRequests.map(async (request) => {
      const employee = await database.findOne('employees', { _id: new ObjectId(request.employeeId) });
      return {
        ...request,
        employee: employee ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          position: employee.position,
          department: employee.department
        } : null
      };
    })
  );

  const total = await database.count('leave_requests', query);

  res.json({
    leaveRequests: requestsWithEmployees,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get leave balance for an employee
router.get('/balance/:employeeId', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const { employeeId } = req.params;

  if (!ObjectId.isValid(employeeId)) {
    return res.status(400).json({ message: 'Invalid employee ID' });
  }

  // Mock leave balance - in a real system, this would be calculated based on company policy
  const leaveBalance = {
    VACATION: 20,
    SICK: 10,
    PERSONAL: 5,
    MATERNITY: 90,
    PATERNITY: 14,
    BEREAVEMENT: 3,
    STUDY: 5,
    EMERGENCY: 2
  };

  res.json({
    leaveBalance,
    employeeId
  });
}));

// Get my leave requests
router.get('/my-leaves', asyncHandler(async (req, res) => {
  const { year, status, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  // Get employee by user ID
  const employee = await database.findOne('employees', { userId: new ObjectId(req.user.userId) });
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  let query = { employeeId: employee._id.toString() };
  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    query.startDate = { $gte: startDate, $lte: endDate };
  }
  if (status) query.status = status;

  const leaveRequests = await database.find('leave_requests', query, {
    skip,
    limit,
    sort: { createdAt: -1 }
  });

  // Mock leave balance - in a real system, this would be calculated
  const leaveBalance = {
    VACATION: 20,
    SICK: 10,
    PERSONAL: 5,
    MATERNITY: 90,
    PATERNITY: 14,
    BEREAVEMENT: 3,
    STUDY: 5,
    EMERGENCY: 2
  };

  const total = await database.count('leave_requests', query);

  res.json({
    leaveRequests,
    leaveBalance,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get all leave balances (for HR/Admin)
router.get('/balances', checkRole('ADMIN', 'HR'), asyncHandler(async (req, res) => {
  // Get all employees
  const employees = await database.find('employees', { isActive: true });
  
  // Mock leave balances for all employees
  const leaveBalances = employees.map(employee => ({
    employeeId: employee._id.toString(),
    employeeName: `${employee.firstName} ${employee.lastName}`,
    department: employee.department,
    leaveBalance: {
      VACATION: 20,
      SICK: 10,
      PERSONAL: 5,
      MATERNITY: 90,
      PATERNITY: 14,
      BEREAVEMENT: 3,
      STUDY: 5,
      EMERGENCY: 2
    }
  }));

  res.json({
    leaveBalances,
    totalEmployees: employees.length
  });
}));

// Get team leaves (for managers)
router.get('/team-leaves', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const { timeRange, managerId } = req.query;
  
  // Calculate date range based on timeRange
  let startDate, endDate;
  const now = new Date();
  
  switch (timeRange) {
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
    default:
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = now;
  }

  // Get leave requests within the date range
  const leaveRequests = await database.find('leave_requests', {
    startDate: { $gte: startDate, $lte: endDate }
  }, {
    sort: { startDate: -1 }
  });

  // Get employee details for each request
  const requestsWithEmployees = await Promise.all(
    leaveRequests.map(async (request) => {
      const employee = await database.findOne('employees', { _id: new ObjectId(request.employeeId) });
      return {
        ...request,
        employee: employee ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          position: employee.position,
          department: employee.department
        } : null
      };
    })
  );

  // Calculate team statistics
  const stats = {
    totalRequests: leaveRequests.length,
    approvedRequests: leaveRequests.filter(r => r.status === 'APPROVED').length,
    pendingRequests: leaveRequests.filter(r => r.status === 'PENDING').length,
    rejectedRequests: leaveRequests.filter(r => r.status === 'REJECTED').length,
    totalDays: leaveRequests.reduce((sum, r) => sum + (r.daysRequested || 0), 0)
  };

  res.json({
    teamLeaves: requestsWithEmployees,
    stats,
    timeRange,
    dateRange: { startDate, endDate }
  });
}));

// Get team leave requests
router.get('/team/:managerId', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const { managerId } = req.params;

  // For now, return all leave requests
  // In a real system, you'd filter by team members
  const leaveRequests = await database.find('leave_requests', { status: 'PENDING' }, {
    sort: { createdAt: -1 },
    limit: 20
  });

  // Get employee details for each request
  const requestsWithEmployees = await Promise.all(
    leaveRequests.map(async (request) => {
      const employee = await database.findOne('employees', { _id: new ObjectId(request.employeeId) });
      return {
        ...request,
        employee: employee ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          position: employee.position,
          department: employee.department
        } : null
      };
    })
  );

  res.json({
    pendingRequests: requestsWithEmployees
  });
}));

module.exports = router;