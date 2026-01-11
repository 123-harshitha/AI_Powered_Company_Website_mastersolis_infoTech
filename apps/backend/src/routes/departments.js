const express = require('express');
const { body, validationResult } = require('express-validator');
const { ObjectId } = require('mongodb');
const database = require('../database/connection');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Get all departments
router.get('/', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const departments = await database.find('departments', { isActive: true });
  res.json({ departments });
}));

// Get department by ID
router.get('/:id', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid department ID' });
  }

  const department = await database.findOne('departments', { _id: new ObjectId(id) });
  
  if (!department) {
    return res.status(404).json({ message: 'Department not found' });
  }

  res.json({ department });
}));

// Create department
router.post('/', checkRole('ADMIN', 'HR'), [
  body('name').notEmpty().withMessage('Department name required'),
  body('description').optional().isString(),
  body('costCenter').optional().isString(),
  body('budget').optional().isNumeric(),
  body('location').optional().isString()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { name, description, costCenter, budget, location } = req.body;

  // Check if department already exists
  const existingDept = await database.findOne('departments', { name });
  if (existingDept) {
    return res.status(400).json({ message: 'Department with this name already exists' });
  }

  const departmentData = {
    name,
    description: description || null,
    costCenter: costCenter || null,
    budget: budget || null,
    location: location || null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await database.insertOne('departments', departmentData);

  res.status(201).json({
    message: 'Department created successfully',
    department: { id: result.insertedId, ...departmentData }
  });
}));

// Update department
router.put('/:id', checkRole('ADMIN', 'HR'), [
  body('name').optional().notEmpty(),
  body('description').optional().isString(),
  body('costCenter').optional().isString(),
  body('budget').optional().isNumeric(),
  body('location').optional().isString()
], asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid department ID' });
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
    'departments',
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ message: 'Department not found' });
  }

  res.json({
    message: 'Department updated successfully',
    department: { id, ...updateData }
  });
}));

// Delete department (soft delete)
router.delete('/:id', checkRole('ADMIN'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid department ID' });
  }

  // Soft delete - mark as inactive
  const result = await database.updateOne(
    'departments',
    { _id: new ObjectId(id) },
    { 
      $set: { 
        isActive: false,
        updatedAt: new Date()
      }
    }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ message: 'Department not found' });
  }

  res.json({ message: 'Department deactivated successfully' });
}));

module.exports = router;