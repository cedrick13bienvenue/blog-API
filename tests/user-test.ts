import request from 'supertest';
import { app } from '../index';

const prefix = '/api/auth/';

describe('User Registration and Authentication', () => {
    describe('User Registration', () => {
        it('should create user successfully with valid data', async () => {
            const res = await request(app)
                .post(`${prefix}register`)
                .send({
                    name: 'cedrick',
                    email: `cedrick-${Date.now()}@example.com`,
                    password: 'password123',
                    gender: 'male',
                });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('should fail with invalid role', async () => {
            const res = await request(app)
                .post(`${prefix}register`)
                .send({
                    name: 'cedrick',
                    email: `cedrick-invalid-${Date.now()}@example.com`,
                    password: 'password123',
                    gender: 'male',
                    role: 'invalid_role' // Invalid role
                });
            expect(res.status).toBe(500); // Sequelize validation error
        });

        it('should fail when user already exists', async () => {
            const email = `cedrick-duplicate-${Date.now()}@example.com`;
            
            // First registration
            await request(app)
                .post(`${prefix}register`)
                .send({
                    name: 'cedrick',
                    email: email,
                    password: 'password123',
                    gender: 'male',
                });

            // Second registration with same email
            const res = await request(app)
                .post(`${prefix}register`)
                .send({
                    name: 'cedrick',
                    email: email,
                    password: 'password123',
                    gender: 'male',
                });
            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Email already in use');
        });
    });

    describe('User Login', () => {
        beforeEach(async () => {
            // Create a test user for login tests
            await request(app)
                .post(`${prefix}register`)
                .send({
                    name: 'cedrick',
                    email: `cedrick-login-${Date.now()}@example.com`,
                    password: 'password123',
                    gender: 'male',
                });
        });

        it('should login successfully with valid credentials', async () => {
            const email = `cedrick-login-${Date.now()}@example.com`;
            
            // Register user
            await request(app)
                .post(`${prefix}register`)
                .send({
                    name: 'cedrick',
                    email: email,
                    password: 'password123',
                    gender: 'male',
                });

            // Login
            const res = await request(app)
                .post(`${prefix}login`)
                .send({
                    email: email,
                    password: 'password123'
                });
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.token).toBeDefined();
        });

        it('should fail with invalid credentials', async () => {
            const res = await request(app)
                .post(`${prefix}login`)
                .send({
                    email: 'nonexistent@example.com',
                    password: 'wrongpassword'
                });
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('User Profile', () => {
        let token: string;

        beforeEach(async () => {
            // Create and login a user
            const email = `cedrick-profile-${Date.now()}@example.com`;
            
            await request(app)
                .post(`${prefix}register`)
                .send({
                    name: 'cedrick',
                    email: email,
                    password: 'password123',
                    gender: 'male',
                });

            const loginRes = await request(app)
                .post(`${prefix}login`)
                .send({
                    email: email,
                    password: 'password123'
                });

            token = loginRes.body.data.token;
        });

        it('should get user profile with valid token', async () => {
            const res = await request(app)
                .get(`${prefix}profile`)
                .set('Authorization', `Bearer ${token}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('cedrick');
        });

        it('should fail to get profile without token', async () => {
            const res = await request(app)
                .get(`${prefix}profile`);
            expect(res.status).toBe(401);
        });

        it('should fail to get profile with invalid token', async () => {
            const res = await request(app)
                .get(`${prefix}profile`)
                .set('Authorization', 'Bearer invalid_token');
            expect(res.status).toBe(403); // Changed from 500 to 403
        });
    });
}); 