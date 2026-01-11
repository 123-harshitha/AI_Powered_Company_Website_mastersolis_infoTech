const request = require('supertest');
const database = require('../database/connection');

const app = require('../server');

// Test user credentials (will be created in setup)
let adminToken = '';
let employeeToken = '';
let departmentId = '';
let employeeId = '';

describe('Mastersolis Infotech System Tests', () => {
  beforeAll(async () => {
    // Clean up test data in correct order (respecting foreign key constraints)
    // First delete all dependent records
    await prisma.auditLog.deleteMany();
    await prisma.performanceReview.deleteMany();
    await prisma.payroll.deleteMany();
    await prisma.leaveRequest.deleteMany();
    await prisma.attendance.deleteMany();
    
    // Then delete employees (which have foreign keys to departments)
    await prisma.employee.deleteMany();
    
    // Finally delete departments and users
    await prisma.department.deleteMany();
    await prisma.user.deleteMany();

    // Create test admin user
    const adminUser = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'admin@test.com',
        username: 'admin',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        department: 'IT',
        position: 'Admin'
      });

    adminToken = adminUser.headers['set-cookie']
      .find(cookie => cookie.startsWith('token='))
      ?.split('=')[1]?.split(';')[0];

    // Create test department
    const deptResponse = await request(app)
      .post('/api/departments')
      .set('Cookie', `token=${adminToken}`)
      .send({
        name: 'Engineering',
        description: 'Software development team',
        budget: 1000000,
        location: 'Headquarters'
      });

    departmentId = deptResponse.body.department.id;

    // Create test employee
    const empUser = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'employee@test.com',
        username: 'employee',
        password: 'employee123',
        firstName: 'John',
        lastName: 'Doe',
        role: 'EMPLOYEE',
        department: 'Engineering',
        position: 'Software Developer'
      });

    employeeToken = empUser.headers['set-cookie']
      .find(cookie => cookie.startsWith('token='))
      ?.split('=')[1]?.split(';')[0];

    const empResponse = await prisma.employee.findFirst({
      where: { user: { email: 'employee@test.com' } }
    });
    employeeId = empResponse.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Department Management', () => {
    test('should create department', async () => {
      const response = await request(app)
        .post('/api/departments')
        .set('Cookie', `token=${adminToken}`)
        .send({
          name: 'Marketing',
          description: 'Marketing and sales team',
          budget: 500000,
          location: 'Branch Office'
        });

      expect(response.status).toBe(201);
      expect(response.body.department.name).toBe('Marketing');
    });

    test('should get departments list', async () => {
      const response = await request(app)
        .get('/api/departments')
        .set('Cookie', `token${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.departments).toBeInstanceOf(Array);
      expect(response.body.departments.length).toBeGreaterThan(0);
    });

    test('should update department', async () => {
      const dept = await prisma.department.findFirst({
        where: { name: 'Marketing' }
      });

      const response = await request(app)
        .put(`/api/departments/${dept.id}`)
        .set('Cookie', `token=${adminToken}`)
        .send({
          budget: 750000
        });

      expect(response.status).toBe(200);
      expect(response.body.department.budget).toBe(750000);
    });
  });

  describe('Attendance Management', () => {
    test('should clock in employee', async () => {
      const response = await request(app)
        .post('/api/attendance/clock-in')
        .set('Cookie', `token=${employeeToken}`)
        .send({
          notes: 'Starting work'
        });

      expect(response.status).toBe(200);
      expect(response.body.attendance.clockIn).toBeDefined();
    });

    test('should get employee attendance', async () => {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await request(app)
        .get(`/api/attendance/my-attendance?year=${year}&month=${month}`)
        .set('Cookie', `token=${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.attendanceRecords).toBeInstanceOf(Array);
      expect(response.body.summary).toBeDefined();
    });

    test('should clock out employee', async () => {
      const response = await request(app)
        .post('/api/attendance/clock-out')
        .set('Cookie', `token=${employeeToken}`);

      expect(response.status).toBe(200);
      expect(response.body.attendance.clockOut).toBeDefined();
      expect(response.body.attendance.hoursWorked).toBeDefined();
    });
  });

  describe('Leave Management', () => {
    test('should submit leave request', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 7); // 1 week from now
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 2); // 3 days off

      const response = await request(app)
        .post('/api/leave-requests')
        .set('Cookie', `token=${employeeToken}`)
        .send({
          leaveType: 'VACATION',
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          reason: 'Family vacation',
          workCoverage: 'Peers will handle urgent tasks'
        });

      expect(response.status).toBe(201);
      expect(response.body.leaveRequest.status).toBe('PENDING');
    });

    test('should get pending leave requests for approval', async () => {
      const response = await request(app)
        .get('/api/leave-requests/pending')
        .set('Cookie', `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.leaveRequests).toBeInstanceOf(Array);
    });

    test('should approve leave request', async () => {
      const leaveRequest = await prisma.leaveRequest.findFirst({
        where: { status: 'PENDING' }
      });

      const response = await request(app)
        .put(`/api/leave-requests/${leaveRequest.id}/approve`)
        .set('Cookie', `token=${adminToken}`)
        .send({
          action: 'APPROVED'
        });

      expect(response.status).toBe(200);
      expect(response.body.leaveRequest.status).toBe('APPROVED');
    });
  });

  describe('Payroll Management', () => {
    test('should create payroll record', async () => {
      const payStart = new Date();
      payStart.setDate(1); // First day of month
      const payEnd = new Date(payStart);
      payEnd.setMonth(payEnd.getMonth() + 1);
      payEnd.setDate(0); // Last day of month

      const response = await request(app)
        .post('/api/payroll')
        .set('Cookie', `token=${adminToken}`)
        .send({
          employeeId: employeeId,
          payPeriodStart: payStart.toISOString(),
          payPeriodEnd: payEnd.toISOString(),
          grossSalary: 7500,
          basicSalary: 6000,
          allowances: { housing: 1000, transport: 500 },
          deductions: { tax: 750, health: 100 },
          overtimePay: 0,
          bonus: 500
        });

      expect(response.status).toBe(201);
      expect(response.body.payroll.netSalary).toBeDefined();
    });

    test('should process payroll for all employees', async () => {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();

      const response = await request(app)
        .post('/api/payroll/process')
        .set('Cookie', `token=${adminToken}`)
        .send({
          month,
          year,
          customAllowances: { performance: 200 },
          customDeductions: { insurance: 150 }
        });

      expect(response.status).toBe(201);
      expect(response.body.processedCount).toBeGreaterThan(0);
 });
  });

  describe('Job Posting System', () => {
    test('should create job posting', async () => {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30);

      const response = await request(app)
        .post('/api/job-postings')
        .set('Cookie', `token=${adminToken}`)
        .send({
          title: 'Senior Software Engineer',
          description: 'Join our engineering team to build amazing products',
          requirements: ['5+ years experience', 'React knowledge', 'Node.js'],
          responsibilities: ['Design APIs', 'Lead team projects', 'Code reviews'],
          salaryMin: 80000,
          salaryMax: 120000,
          location: 'San Francisco',
          employmentType: 'FULL_TIME',
          remoteAllowed: true,
          applicationDeadline: deadline.toISOString()
        });

      expect(response.status).toBe(201);
      expect(response.body.jobPosting.title).toBe('Senior Software Engineer');
    });

    test('should get public job postings', async () => {
      const response = await request(app)
        .get('/api/job-postings/public');

      expect(response.status).toBe(200);
      expect(response.body.jobPostings).toBeInstanceOf(Array);
    });

    test('should publish job posting', async () => {
      const jobPosting = await prisma.jobPosting.findFirst({
        where: { status: 'DRAFT' }
      });

      const response = await request(app)
        .post(`/api/job-postings/${jobPosting.id}/publish`)
        .set('Cookie', `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.jobPosting.status).toBe('PUBLISHED');
    });
  });

  describe('Candidate Management', () => {
    test('should submit job application', async () => {
      const jobPosting = await prisma.jobPosting.findFirst({
        where: { status: 'PUBLISHED' }
      });

      const fs = require('fs');
      
      // Create a dummy resume file for testing
      const testResumePath = 'test-resume.txt';
      fs.writeFileSync(testResumePath, `
        John Candidate
        john.candidate@email.com
        (555) 123-4567
        
        Experience
        Software Developer at XYZ Corp (2020-2023)
        - Built React applications
        - Managed Node.js APIs
        - Worked with MongoDB
        
        Skills
        JavaScript, Python, React, Node.js, MongoDB, AWS
        Leadership, Communication, Problem Solving
        
        Education
        Bachelor's in Computer Science
        University of Technology (2018)
      `);

      const response = await request(app)
        .post('/api/candidates/apply')
        .field('firstName', 'John')
        .field('lastName', 'Candidate')
        .field('email', 'john.candidate@test.com')
        .field('phoneNumber', '(555) 123-4567')
        .field('jobPostingId', jobPosting.id)
        .field('coverLetter', 'I am excited to apply for this position')
        .field('expectedSalary', '95000')
        .attach('resumeFile', testResumePath);

      // Clean up test file
      fs.unlinkSync(testResumePath);

      expect(response.status).toBe(201);
      expect(response.body.candidate.status).toBe('APPLIED');
    });

    test('should get candidates for HR review', async () => {
      const response = await request(app)
        .get('/api/candidates')
        .set('Cookie', `token=${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.candidates).toBeInstanceOf(Array);
      expect(response.body.summary.totalCandidates).toBeGreaterThan(0);
    });

    test('should update candidate status', async () => {
      const candidate = await prisma.candidate.findFirst({
        where: { status: 'APPLIED' }
      });

      const response = await request(app)
        .put(`/api/candidates/${candidate.id}`)
        .set('Cookie', `token=${adminToken}`)
        .send({
          status: 'REJECTED',
          interviewNotes: 'Too little experience'
        });

      expect(response.status).toBe(200);
      expect(response.body.candidate.status).toBe('REJECTED');
    });
  });

  describe('Access Control & Security', () => {
    test('should prevent unauthorized department access', async () => {
      const response = await request(app)
        .get('/api/departments')
        .set('Cookie', `token=${employeeToken}`);

      expect(response.status).toBe(403);
    });

    test('should prevent unauthorized payroll access', async () => {
      const response = await request(app)
        .get('/api/payroll')
        .set('Cookie', `token=${employeeToken}`);

      expect(response.status).toBe(403);
    });

    test('should protect admin-only endpoints', async () => {
      const response = await request(app)
        .delete('/api/departments/some-id')
        .set('Cookie', `token=${employeeToken}`);

      expect(response.status).toBe(403);
    });

    test('should allow employees to view own data', async () => {
      const response = await request(app)
        .get('/api/payroll/my-payroll')
        .set('Cookie', `token=${employeeToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Authentication & Validation', () => {
    test('should require authentication for protected routes', async () => {
      const response = await request(app)
        .get('/api/departments');

      expect(response.status).toBe(401);
    });

    test('should validate input data', async () => {
      const response = await request(app)
        .post('/api/departments')
        .set('Cookie', `token=${adminToken}`)
        .send({
          name: '', // Invalid empty name
          budget: -1000 // Invalid negative budget
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation errors');
    });

    test('should prevent duplicate department names', async () => {
      const response = await request(app)
        .post('/api/departments')
        .set('Cookie', `token=${adminToken}`)
        .send({
          name: 'Engineering' // Already exists
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Department with this name already exists');
    });
  });
});
