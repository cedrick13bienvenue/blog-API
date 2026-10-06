import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Sequelize } from 'sequelize';

describe('Database Connection Test', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      username: 'postgres',
      password: 'cedrique13',
      database: 'blogAPI-Test',
      host: 'localhost',
      port: 5432,
      dialect: 'postgres',
      logging: false,
    });
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  it('should connect to test database successfully', async () => {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection successful');
      expect(true).toBe(true);
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  });

  it('should be able to query the database', async () => {
    try {
      const result = await sequelize.query('SELECT 1 as test');
      expect(result[0]).toEqual([{ test: 1 }]);
    } catch (error) {
      console.error('❌ Database query failed:', error);
      throw error;
    }
  });
}); 