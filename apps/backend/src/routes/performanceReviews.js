const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { ObjectId } = require('mongodb');
const database = require('../database/connection');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Get performance reviews
router.get('/', asyncHandler(async (req, res) => {
  const { employeeId, status, reviewType, year, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const skip = (page - 1) * limit;

  let query = {};
  if (employeeId) query.employeeId = employeeId;
  if (status) query.status = status;
  if (reviewType) query.reviewType = reviewType;
  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    query.reviewDate = { $gte: startDate, $lte: endDate };
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const reviews = await database.find('performance_reviews', query, {
    skip,
    limit,
    sort
  });

  // Get employee and reviewer details for each review
  const reviewsWithDetails = await Promise.all(
    reviews.map(async (review) => {
      const employee = await database.findOne('employees', { _id: new ObjectId(review.employeeId) });
      const reviewer = await database.findOne('employees', { _id: new ObjectId(review.reviewerId) });
      
      return {
        ...review,
        employee: employee ? {
          firstName: employee.firstName,
          lastName: employee.lastName,
          position: employee.position,
          department: employee.department
        } : null,
        reviewer: reviewer ? {
          firstName: reviewer.firstName,
          lastName: reviewer.lastName,
          position: reviewer.position
        } : null
      };
    })
  );

  const total = await database.count('performance_reviews', query);

  res.json({
    reviews: reviewsWithDetails,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Get my performance reviews
router.get('/my-reviews', asyncHandler(async (req, res) => {
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
    query.reviewDate = { $gte: startDate, $lte: endDate };
  }
  if (status) query.status = status;

  const reviews = await database.find('performance_reviews', query, {
    skip,
    limit,
    sort: { reviewDate: -1 }
  });

  // Get reviewer details for each review
  const reviewsWithReviewers = await Promise.all(
    reviews.map(async (review) => {
      const reviewer = await database.findOne('employees', { _id: new ObjectId(review.reviewerId) });
      
      return {
        ...review,
        reviewer: reviewer ? {
          firstName: reviewer.firstName,
          lastName: reviewer.lastName,
          position: reviewer.position
        } : null
      };
    })
  );

  // Calculate stats
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 
    ? reviews.reduce((sum, review) => sum + review.overallRating, 0) / totalReviews 
    : 0;

  const total = await database.count('performance_reviews', query);

  res.json({
    reviews: reviewsWithReviewers,
    stats: {
      totalReviews,
      averageRating: Math.round(avgRating * 10) / 10
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Create performance review
router.post('/', checkRole('ADMIN', 'HR', 'MANAGER'), [
  body('employeeId').notEmpty().withMessage('Employee ID required'),
  body('reviewPeriod').notEmpty().withMessage('Review period required'),
  body('overallRating').isNumeric().withMessage('Overall rating must be a number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation errors',
      errors: errors.array()
    });
  }

  const { employeeId, reviewPeriod, overallRating, goals, achievements, areasForImprovement, comments } = req.body;

  // Get reviewer (current user)
  const reviewer = await database.findOne('employees', { userId: new ObjectId(req.user.userId) });
  if (!reviewer) {
    return res.status(404).json({ message: 'Reviewer not found' });
  }

  const review = {
    employeeId,
    reviewerId: reviewer._id.toString(),
    reviewPeriod,
    reviewDate: new Date(),
    overallRating: parseInt(overallRating),
    goals: goals || [],
    achievements: achievements || [],
    areasForImprovement: areasForImprovement || [],
    comments: comments || '',
    status: 'COMPLETED',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await database.insertOne('performance_reviews', review);

  res.status(201).json({
    message: 'Performance review created successfully',
    review: {
      id: result.insertedId,
      ...review
    }
  });
}));

// Update performance review
router.put('/:id', checkRole('ADMIN', 'HR', 'MANAGER'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid review ID' });
  }

  const updateData = {
    ...req.body,
    updatedAt: new Date()
  };

  const result = await database.updateOne(
    'performance_reviews',
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  if (result.matchedCount === 0) {
    return res.status(404).json({ message: 'Performance review not found' });
  }

  res.json({
    message: 'Performance review updated successfully',
    review: { id, ...updateData }
  });
}));

// Submit self-rating
router.post('/:id/self-rating', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { selfRating, selfComments } = req.body;
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid review ID' });
  }

  // Verify this review belongs to the current user
  const employee = await database.findOne('employees', { userId: new ObjectId(req.user.userId) });
  if (!employee) {
    return res.status(404).json({ message: 'Employee not found' });
  }

  const review = await database.findOne('performance_reviews', { 
    _id: new ObjectId(id),
    employeeId: employee._id.toString()
  });

  if (!review) {
    return res.status(404).json({ message: 'Performance review not found' });
  }

  const updateData = {
    selfRating: parseInt(selfRating),
    selfComments: selfComments || '',
    updatedAt: new Date()
  };

  await database.updateOne(
    'performance_reviews',
    { _id: new ObjectId(id) },
    { $set: updateData }
  );

  res.json({
    message: 'Self-rating submitted successfully',
    selfRating: parseInt(selfRating)
  });
}));

// Delete performance review
router.delete('/:id', checkRole('ADMIN', 'HR'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid review ID' });
  }

  const result = await database.deleteOne('performance_reviews', { _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return res.status(404).json({ message: 'Performance review not found' });
  }

  res.json({ message: 'Performance review deleted successfully' });
}));

module.exports = router;