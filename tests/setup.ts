import supertest from 'supertest';
import { Sequelize } from 'sequelize';
import { beforeAll, beforeEach, afterEach, afterAll, jest } from '@jest/globals';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import { ensureAuthenticated } from '../src/middlewares/auth';
import { swaggerSpec, swaggerUi } from '../src/swagger';
import config from '../config/config';

// Set test environment BEFORE importing anything else
process.env.NODE_ENV = 'test';

dotenv.config();

// Test database configuration
const testDbConfig = config.test;

let sequelize: Sequelize;
let app: express.Application | undefined;

export const userResponse = {
  token: '',
  adminToken: '',
  userToken: '',
};
export const prefix = '/api/';

// Only setup database if we're running integration tests
const isIntegrationTest = process.argv.some(arg => 
  arg.includes('auth-test') || 
  arg.includes('blog-test') || 
  arg.includes('comment-test') || 
  arg.includes('like-test') ||
  arg.includes('user-test')
);

if (isIntegrationTest) {
  beforeAll(async () => {
    try {
      // Ensure test environment variables are set
      process.env.TEST_DATABASE = testDbConfig.database;
      process.env.TEST_USERNAME = testDbConfig.username;
      process.env.TEST_PASSWORD = testDbConfig.password;
      process.env.TEST_HOST = testDbConfig.host;
      process.env.TEST_PORT = testDbConfig.port?.toString();
      
      // Connect to test database first
      sequelize = new Sequelize({
        ...testDbConfig,
        dialect: 'postgres',
        logging: false,
      });
      
      await sequelize.authenticate();
      console.log(`✅ Test Database Connected: ${testDbConfig.database}`);
      
      // Import and sync models for testing
      const { syncModels } = await import('../src/models');
      await syncModels();
      console.log('✅ Test Database Models Synced');
      
      // Create test app AFTER database is set up
      app = express();
      const PORT = process.env.TEST_SERVER_PORT || 5501;

      // Middleware
      app.use(cors());
      app.use(express.json());

      // Session middleware (must come before passport)
      app.use(session({
        secret: process.env.SESSION_SECRET || 'test-session-secret',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
      }));

      app.use(passport.initialize());
      app.use(passport.session());

      // Import routes AFTER database is set up
      const { blogRouter } = await import('../src/routes/blog-routes');
      const authRouter = await import('../src/routes/auth-routes');
      const { commentRouter } = await import('../src/routes/comment-routes');
      const { likeRouter } = await import('../src/routes/like-routes');

      // Routes
      app.use('/api', blogRouter);
      app.use('/api/auth', authRouter.default);
      app.use('/api', commentRouter);
      app.use('/api', likeRouter);

      // Swagger UI
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

      // Root route
      app.get('/', (_req, res) => {
        res.send('📝 Blog API Test');
      });

      app.get('/dashboard', ensureAuthenticated, (req, res) => {
        res.json({ user: req.user });
      });
      
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }, 15000);

  beforeEach(async () => {
    // Clear database before each test
    try {
      await sequelize.query('TRUNCATE TABLE users, blogs, comments, likes CASCADE');
      console.log('🧹 Test Database cleared before test');
    } catch (error) {
      console.log('No tables to clear or tables already empty');
    }
  });

  afterAll(async () => {
    jest.clearAllMocks();
    if (sequelize) {
      await sequelize.close();
      console.log('🔌 Test Database Connection Closed');
    }
  });
}

// Create a simple app for non-integration tests
if (!isIntegrationTest) {
  app = express();
  app.use(cors());
  app.use(express.json());
}

// Ensure app is always initialized
if (!app) {
  app = express();
  app.use(cors());
  app.use(express.json());
}

export const request = supertest(app!);

afterEach(() => {
  jest.clearAllMocks();
}); 