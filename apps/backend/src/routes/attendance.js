const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { ObjectId } = require('mongodb');
const database = require('../database/connection');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Get attendance records
router.get('/', asyncHandler(async (req, res) => {
  const { date, employeeId } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};
  if (date) query.date = date;
  if (employeeId) query.employeeId = employeeId;

  const attendance = await database.find('attendance', query, {
    skip,
    limit,
    sort: { date: -1 }
  });

  const total = await database.count('attendance', query);

  res.json({
    attendanceRecords: attendance,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get my attendance
router.get('/my-attendance', asyncHandler(async (req, res) => {
  const { startDate, endDate, page = 1, limit = 10, status } = req.query;
  const skip = (page - 1) * limit;

  // Get employee by user ID
  const employee = await database.findOne('employees', { userId: new ObjectId(req.user.userId) });
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  let query = { employeeId: employee._id.toString() };
  if (startDate) query.date = { $gte: startDate };
  if (endDate) query.date = { ...query.date, $lte: endDate };
  if (status) query.status = status;

  const attendance = await database.find('attendance', query, {
    skip,
    limit,
    sort: { date: -1 }
  });

  // Calculate summary
  const totalHours = attendance.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
  const presentDays = attendance.filter(record => record.status === 'PRESENT').length;
  const totalDays = attendance.length;

  const total = await database.count('attendance', query);

  res.json({
    attendanceRecords: attendance,
    summary: {
      totalHours: totalHours.toFixed(1),
      presentDays,
      totalDays,
      attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Clock in
router.post('/clock-in', asyncHandler(async (req, res) => {
  const { notes, workFromHome } = req.body;

  // Get employee by user ID
  const employee = await database.findOne('employees', { userId: new ObjectId(req.user.userId) });
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  const today = new Date().toISOString().split('T')[0];
  
  // Check if already clocked in today
  const existingRecord = await database.findOne('attendance', {
    employeeId: employee._id.toString(),
    date: today
  });

  if (existingRecord && existingRecord.clockIn) {
    return res.status(400).json({ message: 'Already clocked in today' });
  }

  const clockInTime = new Date();
  
  if (existingRecord) {
    // Update existing record
    await database.updateOne('attendance', 
      { _id: existingRecord._id },
      { 
        $set: { 
          clockIn: clockInTime,
          notes: notes || '',
          workFromHome: workFromHome || false,
          status: 'PRESENT',
          updatedAt: new Date()
        }
      }
    );
  } else {
    // Create new record
    await database.insertOne('attendance', {
      employeeId: employee._id.toString(),
      date: today,
      clockIn: clockInTime,
      notes: notes || '',
      workFromHome: workFromHome || false,
      status: 'PRESENT',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  res.json({ message: 'Clocked in successfully', clockInTime });
}));

// Clock out
router.post('/clock-out', asyncHandler(async (req, res) => {
  const { notes } = req.body;

  // Get employee by user ID
  const employee = await database.findOne('employees', { userId: new ObjectId(req.user.userId) });
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  const today = new Date().toISOString().split('T')[0];
  
  // Find today's record
  const record = await database.findOne('attendance', {
    employeeId: employee._id.toString(),
    date: today
  });

  if (!record || !record.clockIn) {
    return res.status(400).json({ message: 'No clock-in record found for today' });
  }

  if (record.clockOut) {
    return res.status(400).json({ message: 'Already clocked out today' });
  }

  const clockOutTime = new Date();
  const hoursWorked = (clockOutTime - record.clockIn) / (1000 * 60 * 60);

  await database.updateOne('attendance', 
    { _id: record._id },
    { 
      $set: { 
        clockOut: clockOutTime,
        hoursWorked: Math.round(hoursWorked * 10) / 10,
        updatedAt: new Date()
      }
    }
  );

  res.json({ 
    message: 'Clocked out successfully', 
    clockOutTime,
    hoursWorked: Math.round(hoursWorked * 10) / 10
  });
}));

// Get team attendance
router.get('/team', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const { managerId, timeRange } = req.query;

  // For now, return all attendance records
  // In a real system, you'd filter by team members
  const attendance = await database.find('attendance', {}, {
    sort: { date: -1 },
    limit: 50
  });

  // Calculate team stats
  const totalRecords = attendance.length;
  const presentRecords = attendance.filter(record => record.status === 'PRESENT').length;
  const attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;

  res.json({
    attendanceRecords: attendance,
    stats: {
      attendanceRate,
      totalRecords,
      presentRecords
    }
  });
}));

// Get employee attendance
router.get('/employee', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const { employeeId, period } = req.query;

  if (!employeeId) {
    return res.status(400).json({ message: 'Employee ID is required' });
  }

  let query = { employeeId };
  
  // Add period filter if provided
  if (period) {
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), 0, 1); // Year start
    }
    
    query.date = { $gte: startDate.toISOString().split('T')[0] };
  }

  const attendance = await database.find('attendance', query, {
    sort: { date: -1 },
    limit: 100
  });

  // Calculate summary
  const totalHours = attendance.reduce((sum, record) => sum + (record.hoursWorked || 0), 0);
  const presentDays = attendance.filter(record => record.status === 'PRESENT').length;
  const totalDays = attendance.length;

  res.json({
    attendanceRecords: attendance,
    summary: {
      totalHours: totalHours.toFixed(1),
      presentDays,
      totalDays,
      attendanceRate: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
    }
  });
}));

module.exports = router;