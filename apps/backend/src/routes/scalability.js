const express = require('express');
const { PrismaClient } = require('@prisma/client');
const Redis = require('redis');
const { createBullMQ } = require('bullmq');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const prisma = new PrismaClient();

// Redis client for caching
const redis = Redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redis.on('error', (err) => console.log('Redis Client Error', err));
redis.connect();

// BullMQ for background job processing
const { Queue, Worker } = require('bullmq');

// Create queues for different types of processing
const queues = {
  attendance: new Queue('attendance-processing', {
    connection: { host: 'localhost', port: 6379 },
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 50,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  }),
  payroll: new Queue('payroll-processing', {
    connection: { host: 'localhost', port: 6379 },
    defaultJobOptions: {
      removeOnComplete: 50,
      removeOnFail: 25,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    },
  }),
  notifications: new Queue('notification-processing', {
    connection: { host: 'localhost', port: 6379 },
    defaultJobOptions: {
      removeOnComplete: 200,
      removeOnFail: 100,
      attempts: 2,
      backoff: {
        type: 'fixed',
        delay: 1000,
      },
    },
  }),
  analytics: new Queue('analytics-processing', {
    connection: { host: 'localhost', port: 6379 },
    defaultJobOptions: {
      removeOnComplete: 50,
      removeOnFail: 25,
      attempts: 2,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
    },
  })
};

// Cache configuration
const CACHE_TTL = {
  EMPLOYEE_LIST: 300, // 5 minutes
  DEPARTMENT_STATS: 600, // 10 minutes
  ATTENDANCE_SUMMARY: 300, // 5 minutes
  PAYROLL_SUMMARY: 1800, // 30 minutes
  PERFORMANCE_METRICS: 900, // 15 minutes
  USER_PERMISSIONS: 3600, // 1 hour
};

// Database connection pooling configuration
const prismaConfig = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
};

// Enhanced Prisma client with connection pooling
const prismaPool = new PrismaClient({
  ...prismaConfig,
  // Connection pool settings for high concurrency
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=20&pool_timeout=20'
    }
  }
});

// Caching middleware
const cacheMiddleware = (key, ttl = 300) => {
  return async (req, res, next) => {
    try {
      const cacheKey = `${key}:${JSON.stringify(req.query)}:${req.user?.id || 'anonymous'}`;
      const cached = await redis.get(cacheKey);
      
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      res.sendResponse = res.json;
      res.json = (data) => {
        redis.setEx(cacheKey, ttl, JSON.stringify(data));
        res.sendResponse(data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Pagination middleware for large datasets
const paginationMiddleware = (defaultLimit = 50, maxLimit = 1000) => {
  return (req, res, next) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit) || defaultLimit));
    const offset = (page - 1) * limit;
    
    req.pagination = { page, limit, offset };
    next();
  };
};

// Batch processing for large operations
const batchProcessMiddleware = (batchSize = 100) => {
  return (req, res, next) => {
    req.batchSize = batchSize;
    next();
  };
};

// Real-time data processing endpoints
router.get('/analytics/dashboard', [
  verifyToken,
  checkRole('ADMIN', 'HR', 'MANAGER'),
  cacheMiddleware('dashboard-analytics', CACHE_TTL.PERFORMANCE_METRICS),
  paginationMiddleware(100, 500)
], asyncHandler(async (req, res) => {
  const { page, limit, offset } = req.pagination;
  
  // Parallel data fetching for better performance
  const [
    employeeStats,
    attendanceStats,
    leaveStats,
    performanceStats,
    departmentStats
  ] = await Promise.all([
    // Employee statistics
    prismaPool.employee.aggregate({
      _count: { id: true },
      _avg: { salary: true },
      where: { isActive: true }
    }),
    
    // Attendance statistics
    prismaPool.attendance.groupBy({
      by: ['status'],
      _count: { id: true },
      where: {
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      }
    }),
    
    // Leave statistics
    prismaPool.leaveRequest.groupBy({
      by: ['status'],
      _count: { id: true },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    
    // Performance statistics
    prismaPool.performanceReview.groupBy({
      by: ['status'],
      _count: { id: true },
      _avg: { overallRating: true }
    }),
    
    // Department statistics
    prismaPool.department.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            employees: {
              where: { isActive: true }
            }
          }
        }
      }
    })
  ]);

  // Process and aggregate data
  const analytics = {
    employees: {
      total: employeeStats._count.id,
      averageSalary: employeeStats._avg.salary || 0
    },
    attendance: attendanceStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.id;
      return acc;
    }, {}),
    leave: leaveStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.id;
      return acc;
    }, {}),
    performance: performanceStats.reduce((acc, stat) => {
      acc[stat.status] = {
        count: stat._count.id,
        averageRating: stat._avg.overallRating || 0
      };
      return acc;
    }, {}),
    departments: departmentStats.map(dept => ({
      id: dept.id,
      name: dept.name,
      employeeCount: dept._count.employees
    }))
  };

  res.json({
    analytics,
    pagination: { page, limit, total: employeeStats._count.id },
    timestamp: new Date().toISOString()
  });
}));

// Bulk operations for large datasets
router.post('/employees/bulk-update', [
  verifyToken,
  checkRole('ADMIN', 'HR'),
  batchProcessMiddleware(100)
], asyncHandler(async (req, res) => {
  const { updates } = req.body;
  const batchSize = req.batchSize;
  
  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: 'Updates array is required' });
  }

  if (updates.length > 1000) {
    return res.status(400).json({ message: 'Maximum 1000 updates per request' });
  }

  // Process updates in batches
  const results = [];
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    
    const batchResults = await Promise.allSettled(
      batch.map(update => 
        prismaPool.employee.update({
          where: { id: update.id },
          data: update.data
        })
      )
    );
    
    results.push(...batchResults);
  }

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  res.json({
    message: `Bulk update completed`,
    successful,
    failed,
    total: updates.length
  });
}));

// Real-time attendance processing
router.post('/attendance/bulk-process', [
  verifyToken,
  checkRole('ADMIN', 'HR'),
  batchProcessMiddleware(200)
], asyncHandler(async (req, res) => {
  const { attendanceData } = req.body;
  
  if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
    return res.status(400).json({ message: 'Attendance data array is required' });
  }

  // Queue attendance processing job
  const job = await queues.attendance.add('bulk-attendance-process', {
    attendanceData,
    processedBy: req.user.id,
    timestamp: new Date().toISOString()
  }, {
    priority: 5,
    delay: 1000
  });

  res.json({
    message: 'Attendance processing job queued',
    jobId: job.id,
    estimatedProcessingTime: Math.ceil(attendanceData.length / 200) * 30 // seconds
  });
}));

// Real-time payroll processing
router.post('/payroll/generate-bulk', [
  verifyToken,
  checkRole('ADMIN', 'HR'),
  batchProcessMiddleware(50)
], asyncHandler(async (req, res) => {
  const { 
    payPeriodStart, 
    payPeriodEnd, 
    employeeIds = [],
    departmentIds = [] 
  } = req.body;

  if (!payPeriodStart || !payPeriodEnd) {
    return res.status(400).json({ 
      message: 'Pay period start and end dates are required' 
    });
  }

  // Queue payroll generation job
  const job = await queues.payroll.add('bulk-payroll-generate', {
    payPeriodStart: new Date(payPeriodStart),
    payPeriodEnd: new Date(payPeriodEnd),
    employeeIds,
    departmentIds,
    generatedBy: req.user.id,
    timestamp: new Date().toISOString()
  }, {
    priority: 3,
    delay: 2000
  });

  res.json({
    message: 'Payroll generation job queued',
    jobId: job.id,
    estimatedProcessingTime: Math.ceil((employeeIds.length || 1000) / 50) * 60 // seconds
  });
}));

// System health and performance monitoring
router.get('/system/health', [
  verifyToken,
  checkRole('ADMIN')
], asyncHandler(async (req, res) => {
  const startTime = Date.now();
  
  // Check database connection
  const dbStart = Date.now();
  await prismaPool.$queryRaw`SELECT 1`;
  const dbLatency = Date.now() - dbStart;
  
  // Check Redis connection
  const redisStart = Date.now();
  await redis.ping();
  const redisLatency = Date.now() - redisStart;
  
  // Check queue status
  const queueStatus = await Promise.allSettled([
    queues.attendance.getWaiting(),
    queues.payroll.getWaiting(),
    queues.notifications.getWaiting(),
    queues.analytics.getWaiting()
  ]);
  
  const queueStats = {
    attendance: queueStatus[0].status === 'fulfilled' ? queueStatus[0].value.length : 0,
    payroll: queueStatus[1].status === 'fulfilled' ? queueStatus[1].value.length : 0,
    notifications: queueStatus[2].status === 'fulfilled' ? queueStatus[2].value.length : 0,
    analytics: queueStatus[3].status === 'fulfilled' ? queueStatus[3].value.length : 0
  };
  
  // Get system metrics
  const totalEmployees = await prismaPool.employee.count({
    where: { isActive: true }
  });
  
  const totalUsers = await prismaPool.user.count({
    where: { isActive: true }
  });
  
  const responseTime = Date.now() - startTime;
  
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    performance: {
      responseTime,
      dbLatency,
      redisLatency
    },
    metrics: {
      totalEmployees,
      totalUsers,
      queueStats
    },
    thresholds: {
      maxResponseTime: 1000, // 1 second
      maxDbLatency: 500, // 500ms
      maxRedisLatency: 100, // 100ms
      maxQueueBacklog: 1000
    }
  });
}));

// Performance optimization endpoints
router.get('/employees/optimized', [
  verifyToken,
  checkRole('ADMIN', 'HR', 'MANAGER'),
  cacheMiddleware('employees-list', CACHE_TTL.EMPLOYEE_LIST),
  paginationMiddleware(50, 500)
], asyncHandler(async (req, res) => {
  const { page, limit, offset } = req.pagination;
  const { search, department, status } = req.query;
  
  // Build optimized query
  const where = {
    isActive: status === 'active' ? true : status === 'inactive' ? false : undefined
  };
  
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { employeeId: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  if (department) {
    where.departmentId = department;
  }
  
  // Use select to limit fields and improve performance
  const [employees, total] = await Promise.all([
    prismaPool.employee.findMany({
      skip: offset,
      take: limit,
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeId: true,
        position: true,
        isActive: true,
        hireDate: true,
        department: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { firstName: 'asc' }
    }),
    prismaPool.employee.count({ where })
  ]);
  
  res.json({
    employees,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  });
}));

// Real-time notifications system
router.post('/notifications/broadcast', [
  verifyToken,
  checkRole('ADMIN', 'HR')
], asyncHandler(async (req, res) => {
  const { 
    message, 
    type = 'info', 
    targetRoles = [], 
    targetDepartments = [],
    targetEmployees = []
  } = req.body;
  
  if (!message) {
    return res.status(400).json({ message: 'Notification message is required' });
  }
  
  // Queue notification job
  const job = await queues.notifications.add('broadcast-notification', {
    message,
    type,
    targetRoles,
    targetDepartments,
    targetEmployees,
    sentBy: req.user.id,
    timestamp: new Date().toISOString()
  }, {
    priority: 1,
    delay: 500
  });
  
  res.json({
    message: 'Notification broadcast queued',
    jobId: job.id
  });
}));

// Cleanup and maintenance endpoints
router.post('/system/cleanup', [
  verifyToken,
  checkRole('ADMIN')
], asyncHandler(async (req, res) => {
  const { cleanupType = 'all' } = req.body;
  
  const cleanupTasks = [];
  
  if (cleanupType === 'all' || cleanupType === 'cache') {
    cleanupTasks.push(redis.flushAll());
  }
  
  if (cleanupType === 'all' || cleanupType === 'logs') {
    // Clean old audit logs (older than 1 year)
    cleanupTasks.push(
      prismaPool.auditLog.deleteMany({
        where: {
          timestamp: {
            lt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
          }
        }
      })
    );
  }
  
  if (cleanupType === 'all' || cleanupType === 'sessions') {
    // Clean expired sessions (implement if using session storage)
    cleanupTasks.push(Promise.resolve('Sessions cleanup not implemented'));
  }
  
  await Promise.allSettled(cleanupTasks);
  
  res.json({
    message: 'System cleanup completed',
    cleanupType,
    timestamp: new Date().toISOString()
  });
}));

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  
  // Close database connections
  await prismaPool.$disconnect();
  
  // Close Redis connection
  await redis.quit();
  
  // Close all queues
  await Promise.all(Object.values(queues).map(queue => queue.close()));
  
  process.exit(0);
});

module.exports = router;
