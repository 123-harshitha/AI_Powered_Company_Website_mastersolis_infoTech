const { z } = require('zod');

// Common validation schemas
const commonSchemas = {
  mongodbId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ID format'),
  
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  }),

  email: z.string().email('Invalid email format').toLowerCase().trim(),
  
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format').optional(),
  
  date: z.string().datetime().optional(),
  
  currency: z.number().positive('Amount must be positive').optional()
};

// Role validation
const userRoleSchema = z.enum(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE', 'CANDIDATE']);

// Validation middleware factory
const validateSchema = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedBody = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }
      next(error);
    }
  };
};

// Query validation middleware
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.query);
      req.validatedQuery = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Query validation error',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

// User schemas for auth
const userSchemas = {
  register: z.object({
    email: commonSchemas.email,
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: commonSchemas.password,
    firstName: z.string().min(1).max(50).trim(),
    lastName: z.string().min(1).max(50).trim(),
    role: userRoleSchema.default('EMPLOYEE'),
    department: z.string().optional(),
    position: z.string().optional(),
    phoneNumber: commonSchemas.phone
  }),

  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required')
  }),

  updateProfile: z.object({
    firstName: z.string().min(1).max(50).trim().optional(),
    lastName: z.string().min(1).max(50).trim().optional(),
    phoneNumber: commonSchemas.phone,
    department: z.string().optional(),
    position: z.string().optional()
  })
};

// Candidate schemas
const candidateSchemas = {
  register: z.object({
    email: commonSchemas.email,
    password: commonSchemas.password,
    firstName: z.string().min(1).max(50).trim(),
    lastName: z.string().min(1).max(50).trim(),
    phone: commonSchemas.phone
  }),

  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(1, 'Password is required')
  }),

  updateProfile: z.object({
    firstName: z.string().min(1).max(50).trim().optional(),
    lastName: z.string().min(1).max(50).trim().optional(),
    phone: commonSchemas.phone,
    skills: z.array(z.string()).optional(),
    experience: z.array(z.object({
      company: z.string(),
      position: z.string(),
      startDate: z.string(),
      endDate: z.string().optional(),
      description: z.string().optional()
    })).optional(),
    education: z.array(z.object({
      institution: z.string(),
      degree: z.string(),
      field: z.string(),
      graduationYear: z.string(),
      gpa: z.string().optional()
    })).optional()
  }),

  jobApplication: z.object({
    coverLetter: z.string().max(1000).optional(),
    expectedSalary: z.number().positive().optional(),
    availability: z.string().optional(),
    additionalNotes: z.string().max(500).optional()
  })
};

module.exports = {
  commonSchemas,
  userSchemas,
  candidateSchemas,
  validateSchema,
  validateQuery,
  userRoleSchema
};
