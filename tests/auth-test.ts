import request from 'supertest';
import { app } from '../index';

const prefix = '/api/auth/';

describe('Authentication Tests', () => {
  describe('User Registration', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'cedrick',
        email: `cedrick-${Date.now()}@example.com`,
        password: 'password123',
        gender: 'male'
      };

      const res = await request(app).post(`${prefix}register`).send(userData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('email', userData.email);
      expect(res.body.data).toHaveProperty('name', userData.name);
    });

    it('should fail registration with existing email', async () => {
      const userData = {
        name: 'cedrick',
        email: `existing-${Date.now()}@example.com`,
        password: 'password123',
        gender: 'male'
      };

      // Register first user
      await request(app).post(`${prefix}register`).send(userData);

      // Try to register with same email
      const res = await request(app).post(`${prefix}register`).send(userData);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Email already in use');
    });

    it('should fail registration with invalid data', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        password: '123', // too short
        gender: 'invalid'
      };

      const res = await request(app).post(`${prefix}register`).send(invalidData);

      expect(res.status).toBe(400); // Changed from 500 to 400
      expect(res.body.success).toBe(false);
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app).post(`${prefix}register`).send({
        name: 'cedrick',
        email: `cedrick-login-${Date.now()}@test.com`,
        password: 'password123',
        gender: 'male'
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: `cedrick-login-${Date.now()}@test.com`,
        password: 'password123'
      };

      // First register the user
      await request(app).post(`${prefix}register`).send({
        name: 'cedrick',
        email: loginData.email,
        password: 'password123',
        gender: 'male'
      });

      // Then login
      const res = await request(app).post(`${prefix}login`).send(loginData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('user');
    });

    it('should fail login with non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'password123'
      };

      const res = await request(app).post(`${prefix}login`).send(loginData);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should fail login with wrong password', async () => {
      const loginData = {
        email: `cedrick-wrong-${Date.now()}@test.com`,
        password: 'wrongpassword'
      };

      // First register the user
      await request(app).post(`${prefix}register`).send({
        name: 'cedrick',
        email: loginData.email,
        password: 'password123',
        gender: 'male'
      });

      // Then try to login with wrong password
      const res = await request(app).post(`${prefix}login`).send(loginData);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });

    it('should fail login with missing credentials', async () => {
      const res = await request(app).post(`${prefix}login`).send({});

      expect(res.status).toBe(500); // Missing required fields
      expect(res.body.success).toBe(false);
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app).get('/logout');

      expect(res.status).toBe(200);
      expect(res.text).toContain('Logged out');
    });
  });
}); 