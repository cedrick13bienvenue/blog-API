import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger, { logDatabase } from './logger';

dotenv.config();

// Function to determine which database to use based on environment
const getDatabaseConfig = () => {
  const isTest = process.env.NODE_ENV === 'test' || process.argv.some(arg => arg.includes('test'));
  
  logDatabase('Database configuration loaded');
  logger.debug('🔍 Database Config Debug:');
  logger.debug('  NODE_ENV:', process.env.NODE_ENV);
  logger.debug('  isTest:', isTest);
  logger.debug('  TEST_DATABASE:', process.env.TEST_DATABASE);
  logger.debug('  DB_NAME:', process.env.DB_NAME);

  if (isTest) {
    return {
      database: process.env.TEST_DATABASE || 'blogAPI-Test',
      username: process.env.TEST_USERNAME || 'postgres',
      password: process.env.TEST_PASSWORD || 'cedrique13',
      host: process.env.TEST_HOST || 'localhost',
      port: Number(process.env.TEST_PORT || '5432'),
    };
  }

  return {
    database: process.env.DB_NAME || 'blogdb',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'cedrique13',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || '5432'),
  };
};

// Create sequelize instance dynamically
let sequelizeInstance: Sequelize | null = null;

export const getSequelize = () => {
  if (!sequelizeInstance) {
    const config = getDatabaseConfig();
    logDatabase(`Creating Sequelize connection to: ${config.database}`);
    sequelizeInstance = new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      port: config.port,
      dialect: 'postgres',
      logging: false,
    });
  }
  return sequelizeInstance;
};

// For backward compatibility
export const sequelize = getSequelize();

export const connectDB = async () => {
  try {
    const sequelize = getSequelize();
    await sequelize.authenticate();
    const config = getDatabaseConfig();
    logDatabase(`PostgreSQL connected successfully to ${config.database}`);
    logger.info(`✅ PostgreSQL connected successfully to ${config.database}`);
  } catch (err) {
    logger.error('❌ PostgreSQL connection error:', err);
    throw err;
  }
};
