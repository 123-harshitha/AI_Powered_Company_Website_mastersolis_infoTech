// Report generation job handler
const { PrismaClient } = require('@prisma/client');

const generateReport = async (jobData) => {
  const { reportType, filters = {}, requesterEmail, reportPeriod } = jobData;
  
  try {
    console.log(`Generating ${reportType} report`);
    
    const prisma = new PrismaClient();
    let reportData = {};

    switch (reportType) {
      case 'attendance_summary':
        reportData = await generateAttendanceReport(prisma, filters);
        break;
      
      case 'performance_review':
        reportData = await generatePerformanceReport(prisma, filters);
        break;
      
      case 'recruitment_analytics':
        reportData = await generateRecruitmentReport(prisma, filters);
        break;
      
      case 'payroll_summary':
        reportData = await generatePayrollReport(prisma, filters);
        break;
      
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }

    await prisma.$disconnect();

    // Send report via email
    const { addJob } = require('../bullmq');
    await addJob('emailNotifications', 'send-email', {
      type: 'report_generated',
      to: requesterEmail,
      data: {
        reportType,
        reportData: JSON.stringify(reportData, null, 2),
        generatedAt: new Date().toISOString(),
        period: reportPeriod
      }
    });

    console.log(`${reportType} report generated successfully`);
    
    return {
      success: true,
      reportType,
      recordCount: reportData.recordCount || 0,
      generatedAt: new Date()
    };

  } catch (error) {
    console.error(`Report generation failed:`, error);
    throw error;
  }
};

const generateAttendanceReport = async (prisma, filters) => {
  const { startDate, endDate, departmentId } = filters;
  
  const attendanceRecords = await prisma.attendance.findMany({
    where: {
      date: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined
      },
      ...(departmentId && {
        employee: {
          departmentId
        }
      })
    },
    include: {
      employee: {
        include: {
          user: true
        }
      }
    }
  });

  const summary = {
    totalRecords: attendanceRecords.length,
    presentDays: attendanceRecords.filter(r => r.status === 'PRESENT').length,
    absentDays: attendanceRecords.filter(r => r.status === 'ABSENT').length,
    lateDays: attendanceRecords.filter(r => r.status === 'LATE').length,
    averageHours: attendanceRecords.reduce((sum, r) => sum + (r.hoursWorked || 0), 0) / attendanceRecords.length
  };

  return {
    summary,
    records: attendanceRecords,
    recordCount: attendanceRecords.length
  };
};

const generatePerformanceReport = async (prisma, filters) => {
  const reviews = await prisma.performanceReview.findMany({
    where: {
      reviewPeriod: filters.reviewPeriod,
      ...(filters.employeeId && { employeeId: filters.employeeId })
    },
    include: {
      employee: {
        include: {
          user: true
        }
      }
    }
  });

  const summary = {
    totalReviews: reviews.length,
    averageRating: reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length,
    topPerformers: reviews
      .sort((a, b) => b.overallRating - a.overallRating)
      .slice(0, 5)
      .map(r => ({
        employeeName: `${r.employee.firstName} ${r.employee.lastName}`,
        rating: r.overallRating
      })),
    departmentBreakdown: {}
  };

  return {
    summary,
    reviews,
    recordCount: reviews.length
  };
};

const generateRecruitmentReport = async (prisma, filters) => {
  const candidates = await prisma.candidate.findMany({
    where: {
      appliedAt: {
        gte: filters.startDate ? new Date(filters.startDate) : undefined,
        lte: filters.endDate ? new Date(filters.endDate) : undefined
      },
      ...(filters.jobPostingId && { jobPostingId: filters.jobPostingId })
    },
    include: {
      jobPosting: true,
      interviews: true
    }
  });

  const summary = {
    totalApplications: candidates.length,
    interviewedCount: candidates.filter(c => c.interviews.length > 0).length,
    hiredCount: candidates.filter(c => c.status === 'HIRED').length,
    averageFitScore: candidates.reduce((sum, c) => sum + (c.fitScore || 0), 0) / candidates.length,
    statusBreakdown: {
      APPLIED: candidates.filter(c => c.status === 'APPLIED').length,
      INTERVIEWED: candidates.filter(c => c.status === 'INTERVIEWED').length,
      HIRED: candidates.filter(c => c.status === 'HIRED').length,
      REJECTED: candidates.filter(c => c.status === 'REJECTED').length
    }
  };

  return {
    summary,
    candidates,
    recordCount: candidates.length
  };
};

const generatePayrollReport = async (prisma, filters) => {
  const payrollRecords = await prisma.payroll.findMany({
    where: {
      month: filters.month,
      year: filters.year,
      ...(filters.departmentId && {
        employee: {
          departmentId: filters.departmentId
        }
      })
    },
    include: {
      employee: {
        include: {
          user: true
        }
      }
    }
  });

  const summary = {
    totalPayroll: payrollRecords.reduce((sum, r) => sum + r.grossSalary, 0),
    totalDeductions: payrollRecords.reduce((sum, r) => sum + (r.totalDeductions || 0), 0),
    averageSalary: payrollRecords.reduce((sum, r) => sum + r.grossSalary, 0) / payrollRecords.length,
    recordCount: payrollRecords.length
  };

  return {
    summary,
    records: payrollRecords,
    recordCount: payrollRecords.length
  };
};

module.exports = generateReport;
