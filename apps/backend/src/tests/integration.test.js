const request = require('supertest');
const app = require('../server');

describe('SmartHire System Integration Tests', () => {
  let server;

  beforeAll(async () => {
    // Start the server
    server = app.listen(0);
  });

  afterAll(async () => {
    // Close the server
    if (server) {
      server.close();
    }
  });

  describe('Health Check', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
    });
  });

  describe('Authentication Endpoints', () => {
    test('should handle login endpoint', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'testpassword'
        })
        .expect(400); // Should fail with invalid credentials

      expect(response.body).toHaveProperty('message');
    });

    test('should handle registration endpoint', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'testpassword',
          full_name: 'Test User',
          role: 'EMPLOYEE'
        })
        .expect(400); // Should fail with validation or existing user

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Employee Management', () => {
    test('should require authentication for employee endpoints', async () => {
      const response = await request(app)
        .get('/api/employees')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Department Management', () => {
    test('should require authentication for department endpoints', async () => {
      const response = await request(app)
        .get('/api/departments')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Attendance Management', () => {
    test('should require authentication for attendance endpoints', async () => {
      const response = await request(app)
        .get('/api/attendance')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Leave Management', () => {
    test('should require authentication for leave endpoints', async () => {
      const response = await request(app)
        .get('/api/leave-requests')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Payroll Management', () => {
    test('should require authentication for payroll endpoints', async () => {
      const response = await request(app)
        .get('/api/payroll')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Job Posting Management', () => {
    test('should require authentication for job posting endpoints', async () => {
      const response = await request(app)
        .get('/api/job-postings')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Candidate Management', () => {
    test('should require authentication for candidate endpoints', async () => {
      const response = await request(app)
        .get('/api/candidates')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Performance Reviews', () => {
    test('should require authentication for performance review endpoints', async () => {
      const response = await request(app)
        .get('/api/performance-reviews')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('AI Services', () => {
    test('should handle AI service endpoints', async () => {
      const response = await request(app)
        .get('/api/ai/status')
        .expect(200);

      expect(response.body).toHaveProperty('status');
    });
  });

  describe('CORS Configuration', () => {
    test('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/api/employees')
        .expect(204);
    });
  });

  describe('Error Handling', () => {
    test('should handle 404 errors', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint')
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });
});
