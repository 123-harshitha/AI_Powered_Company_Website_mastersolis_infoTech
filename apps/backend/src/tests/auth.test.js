const request = require('supertest');
const app = require('../server');
const database = require('../database/connection');

// Test data
const testUser = {
  email: 'test@example.com',
  username: 'testuser',
  password: 'password123',
  firstName: 'Test',
  lastName: 'User',
  department: 'IT',
  position: 'Developer'
};

const adminUser = {
  email: 'admin@example.com',
  username: 'admin',
  password: 'admin123',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
  department: 'Management',
  position: 'Admin'
};

describe('Auth Routes', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await prisma.employee.deleteMany({
      where: {
        user: {
          email: {
            in: [testUser.email, adminUser.email]
          }
        }
      }
    });
    
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [testUser.email, adminUser.email]
        }
      }
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.user.role).toBe('EMPLOYEE');
      expect(response.body.employee.firstName).toBe(testUser.firstName);
      expect(response.body.employee.lastName).toBe(testUser.lastName);

      // Check if cookies are set
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie']).toContain('token=');
      expect(response.headers['set-cookie']).toContain('refreshToken=');
    });

    it('should register admin user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(adminUser)
        .expect(201);

      expect(response.body.user.role).toBe('ADMIN');
    });

    it('should fail to register with existing email', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.message).toBe('User already exists');
      expect(response.body.field).toBe('email');
    });

    it('should fail to register with existing username', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Try to register with same username
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'different@example.com'
        })
        .expect(400);

      expect(response.body.message).toBe('User already exists');
      expect(response.body.field).toBe('username');
    });

    it('should fail to register with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.message).toBe('Validation errors');
    });

    it('should fail to register with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          password: '123'
        })
        .expect(400);

      expect(response.body.message).toBe('Validation errors');
    });

    it('should fail to register with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: testUser.email,
          username: testUser.username
          // Missing password, firstName, lastName
        })
        .expect(400);

      expect(response.body.message).toBe('Validation errors');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Register a user before each login test
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.username).toBe(testUser.username);

      // Check if cookies are set
      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie']).toContain('token=');
      expect(response.headers['set-cookie']).toContain('refreshToken=');
    });

    it('should fail to login with wrong email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: testUser.password
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail to login with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail to login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Validation errors');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.message).toBe('Logout successful');

      // Check if logout clears cookies
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });

  describe('GET /api/auth/me', () => {
    let authCookie = '';

    beforeEach(async () => {
      // Register and login user
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      authCookie = loginResponse.headers['set-cookie'];
    });

    it('should get current user info', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authCookie)
        .expect(200);

      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.username).toBe(testUser.username);
      expect(response.body.employee.firstName).toBe(testUser.firstName);
      expect(response.body.employee.lastName).toBe(testUser.lastName);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.message).toBe('Authentication required');
    });
  });
});
