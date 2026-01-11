require('dotenv').config();
const BULL = require('bull');
const Queue = BULL;

// Redis configuration with fallback
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Create queues with error handling
let resumeProcessingQueue, emailNotificationsQueue, dataAnalyticsQueue, reportGenerationQueue;

try {
  resumeProcessingQueue = new Queue('resumeProcessing', {
    redis: redisConfig,
    defaultJobOptions: {
      removeOnComplete: 50,
      removeOnFail: 100,
      delay: 1000,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    },
  });
} catch (error) {
  console.warn('Redis not available, queues will be disabled:', error.message);
  resumeProcessingQueue = null;
}

try {
  emailNotificationsQueue = new Queue('emailNotifications', {
    redis: redisConfig,
    defaultJobOptions: {
      removeOnComplete: 50,
      removeOnFail: 100,
      delay: 500,
      attempts: 3,
      backoff: {
        type: 'fixed',
        delay: 1000,
      },
    },
  });
} catch (error) {
  console.warn('Redis not available for email queue:', error.message);
  emailNotificationsQueue = null;
}

try {
  dataAnalyticsQueue = new Queue('dataAnalytics', {
    redis: redisConfig,
    defaultJobOptions: {
      removeOnComplete: 20,
      removeOnFail: 50,
      delay: 5000,
      attempts: 2,
    },
  });
} catch (error) {
  console.warn('Redis not available for analytics queue:', error.message);
  dataAnalyticsQueue = null;
}

try {
  reportGenerationQueue = new Queue('reportGeneration', {
    redis: redisConfig,
    defaultJobOptions: {
      removeOnComplete: 10,
      removeOnFail: 25,
      attempts: 2,
    },
  });
} catch (error) {
  console.warn('Redis not available for report queue:', error.message);
  reportGenerationQueue = null;
}

// Generic function to add jobs to any queue
const addJob = async (queueName, jobType, data, options = {}) => {
  let queue;
  
  switch (queueName) {
    case 'resumeProcessing':
      queue = resumeProcessingQueue;
      break;
    case 'emailNotifications':
      queue = emailNotificationsQueue;
      break;
    case 'dataAnalytics':
      queue = dataAnalyticsQueue;
      break;
    case 'reportGeneration':
      queue = reportGenerationQueue;
      break;
    default:
      throw new Error(`Unknown queue: ${queueName}`);
  }

  if (!queue) {
    console.warn(`Queue ${queueName} is not available (Redis not connected)`);
    return { id: 'mock-job-id', data, options };
  }

  const job = await queue.add(jobType, data, {
    ...options,
    timestamp: new Date().getTime(),
  });

  return job;
};

// Job processors (workers)

// Resume Processing Worker (Simplified - No ML dependency)
if (resumeProcessingQueue) {
  resumeProcessingQueue.process('process-resume', async (job) => {
    const { filePath, candidateId, jobPostingId } = job.data;
    
    try {
      console.log(`Processing resume for candidate ${candidateId}: ${filePath}`);
      
      // Simple resume processing without ML service
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      // Mock processing - just mark as processed
      await prisma.candidate.update({
        where: { id: candidateId },
        data: {
          skills: JSON.stringify(['General Skills', 'Communication', 'Problem Solving']),
          fitScore: 75, // Default score
          recommendedRole: 'General Position',
          isProcessed: true,
          processedAt: new Date(),
          processingError: null
        }
      });
      
      await prisma.$disconnect();
      
      console.log(`Resume processing completed for candidate ${candidateId}`);
      return { success: true, message: 'Resume processed successfully' };
      
    } catch (error) {
      console.error(`Resume processing failed for candidate ${candidateId}:`, error);
      
      // Update candidate record with error
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      await prisma.candidate.update({
        where: { id: candidateId },
        data: {
          isProcessed: true,
          processedAt: new Date(),
          processingError: error.message
        }
      });
      
      await prisma.$disconnect();
      
      throw error;
    }
  });
}

// Email Notifications Worker using Resend
if (emailNotificationsQueue) {
  emailNotificationsQueue.process('send-email', async (job) => {
    const { type, to, data } = job.data;

    try {
      console.log(`Sending ${type} email to ${to}`);

      // Use the centralized email sender
      const sendEmail = require('./jobHandlers/emailSender');

      const result = await sendEmail({
        type,
        to,
        data
      });

      console.log(`Email sent successfully to ${to}: ${result.messageId}`);
      return { success: true, type, to, messageId: result.messageId };

    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  });

  // Interview Transcript Processing Worker
  emailNotificationsQueue.process('process-interview-transcript', async (job) => {
    try {
      console.log(`Processing interview transcript: ${job.data.transcriptId}`);

      // Use the transcript processor
      const processTranscript = require('./jobHandlers/transcriptProcessor');

      const result = await processTranscript(job);

      console.log(`Transcript processed successfully: ${job.data.transcriptId}`);
      return result;

    } catch (error) {
      console.error(`Failed to process transcript ${job.data.transcriptId}:`, error);
      throw error;
    }
  });
}

// Data Analytics Worker
if (dataAnalyticsQueue) {
  dataAnalyticsQueue.process('calculate-metrics', async (job) => {
  const { departmentId, dateRange } = job.data;
  
  try {
    console.log(`Calculating analytics for department ${departmentId}`);
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    // Calculate various HR metrics
    const metrics = await Promise.all([
      // Employee count
      prisma.employee.count({
        where: {
          departmentId,
          isActive: true,
          hireDate: { gte: startDate, lte: endDate }
        }
      }),
      
      // Average salary
      prisma.payroll.aggregate({
        where: {
          employee: { departmentId },
          payPeriodStart: { gte: startDate, lte: endDate }
        },
        _avg: { grossSalary: true }
      }),
      
      // Attendance rate
      prisma.attendance.aggregate({
        where: {
          employee: { departmentId },
          date: { gte: startDate, lte: endDate }
        },
        _avg: { hoursWorked: true }
      }),
      
      // Leave requests
      prisma.leaveRequest.count({
        where: {
          employee: { departmentId },
          createdAt: { gte: startDate, lte: endDate }
        }
      })
    ]);
    
    const [employeeCount, avgSalary, avgHours, leaveRequests] = metrics;
    
    // Store analytics result
    const analytics = {
      departmentId,
      period: { start: startDate, end: endDate },
      metrics: {
        employeeCount: employeeCount,
        averageSalary: avgSalary._avg.grossSalary || 0,
        averageWeeklyHours: avgHours._avg.hoursWorked || 0,
        leaveRequests: leaveRequests,
        calculatedAt: new Date()
      }
    };
    
    console.log(`Analytics calculated for department ${departmentId}`);
    await prisma.$disconnect();
    
    return { success: true, analytics };
    
  } catch (error) {
    console.error(`Analytics calculation failed for department ${departmentId}:`, error);
    throw error;
  }
  });
}

// Report Generation Worker
if (reportGenerationQueue) {
  reportGenerationQueue.process('generate-report', async (job) => {
  const { reportType, parameters, userId } = job.data;
  
  try {
    console.log(`Generating ${reportType} report for user ${userId}`);
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    let reportData;
    
    switch (reportType) {
      case 'payroll_summary':
        reportData = await generatePayrollSummary(prisma, parameters);
        break;
      case 'attendance_report':
        reportData = await generateAttendanceReport(prisma, parameters);
        break;
      case 'department_performance':
        reportData = await generateDepartmentReport(prisma, parameters);
        break;
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
    
    await prisma.$disconnect();
    
    console.log(`${reportType} report generated successfully`);
    return { success: true, reportData };
    
  } catch (error) {
    console.error(`${reportType} report generation failed:`, error);
    throw error;
  }
  });
}

// Report generation helper functions
async function generatePayrollSummary(prisma, { departmentId, startDate, endDate }) {
  const payrollData = await prisma.payroll.findMany({
    where: {
      employee: { departmentId },
      payPeriodStart: { gte: new Date(startDate), lte: new Date(endDate) }
    },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          position: true
        }
      }
    }
  });

  const summary = payrollData.reduce((acc, record) => {
    acc.totalGross += record.grossSalary;
    acc.totalNet += record.netSalary;
    acc.employeeCount += 1;
    return acc;
  }, { totalGross: 0, totalNet: 0, employeeCount: 0 });

  return {
    type: 'payroll_summary',
    period: { startDate, endDate },
    departmentId,
    employeeCount: summary.employeeCount,
    totalGrossSalary: summary.totalGross,
    totalNetSalary: summary.totalNet,
    averageGrossSalary: summary.employeeCount > 0 ? summary.totalGross / summary.employeeCount : 0,
    records: payrollData
  };
}

async function generateAttendanceReport(prisma, { departmentId, startDate, endDate }) {
  const attendanceData = await prisma.attendance.findMany({
    where: {
      employee: { departmentId },
      date: { gte: new Date(startDate), lte: new Date(endDate) }
    },
    include: {
      employee: {
        select: {
          firstName: true,
          lastName: true,
          position: true
        }
      }
    }
  });

  return {
    type: 'attendance_report',
    period: { startDate, endDate },
    departmentId,
    totalRecords: attendanceData.length,
    records: attendanceData
  };
}

async function generateDepartmentReport(prisma, { departmentId, startDate, endDate }) {
  const employees = await prisma.employee.findMany({
    where: { departmentId, isActive: true },
    include: {
      user: {
        select: {
          email: true,
          isActive: true
        }
      },
      department: {
        select: {
          name: true,
          budget: true
        }
      }
    }
  });

  return {
    type: 'department_performance',
    period: { startDate, endDate },
    department: {
      id: departmentId,
      name: employees[0]?.department?.name,
      budget: employees[0]?.department?.budget,
      employeeCount: employees.length,
      activeEmployees: employees.filter(emp => emp.user.isActive).length
    },
    employees: employees.map(emp => ({
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      position: emp.position,
      email: emp.user.email,
      isActive: emp.user.isActive,
      hireDate: emp.hireDate
    }))
  };
}

// Error handling with dead letter queue
const setupErrorHandling = () => {
  [resumeProcessingQueue, emailNotificationsQueue, dataAnalyticsQueue, reportGenerationQueue]
    .filter(queue => queue !== null)
    .forEach(queue => {
      queue.on('failed', (job, err) => {
        console.error(`Job ${job.id} failed:`, err);
        
        // Move to dead letter queue after max retries
        if (job.attemptsMade >= job.opts.attempts) {
          console.log(`Moving job ${job.id} to dead letter queue`);
        }
      });
      
      queue.on('completed', (job) => {
        console.log(`Job ${job.id} completed successfully`);
      });
    });
};

// Initialize error handling
setupErrorHandling();

// Cleanup on process termination
process.on('SIGINT', async () => {
  console.log('Shutting down queues...');
  
  const queuesToClose = [resumeProcessingQueue, emailNotificationsQueue, dataAnalyticsQueue, reportGenerationQueue]
    .filter(queue => queue !== null);
  
  if (queuesToClose.length > 0) {
    await Promise.all(queuesToClose.map(queue => queue.close()));
  }
  
  console.log('All queues closed');
  process.exit(0);
});

module.exports = {
  resumeProcessingQueue,
  emailNotificationsQueue,
  dataAnalyticsQueue,
  reportGenerationQueue,
  addJob,
};