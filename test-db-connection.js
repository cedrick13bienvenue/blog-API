const { Sequelize } = require("sequelize");
require("dotenv").config();

// Test development database connection
const devConfig = {
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "cedrique13",
  database: process.env.DB_NAME || "blogdb",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  dialect: "postgres",
};

// Test test database connection
const testConfig = {
  username: process.env.TEST_USERNAME || "postgres",
  password: process.env.TEST_PASSWORD || "cedrique13",
  database: process.env.TEST_DATABASE || "blogAPI-Test",
  host: process.env.TEST_HOST || "localhost",
  port: Number(process.env.TEST_PORT) || 5432,
  dialect: "postgres",
};

async function testConnection() {
  console.log("🔍 Testing database connections...\n");

  // Test development database
  console.log("📊 Development Database Config:", {
    host: devConfig.host,
    port: devConfig.port,
    database: devConfig.database,
    username: devConfig.username,
  });

  try {
    const devSequelize = new Sequelize(devConfig);
    await devSequelize.authenticate();
    console.log("✅ Development database connected successfully!");
    await devSequelize.close();
  } catch (error) {
    console.log("❌ Development database connection failed:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Test test database
  console.log("Test Database Config:", {
    host: testConfig.host,
    port: testConfig.port,
    database: testConfig.database,
    username: testConfig.username,
  });

  try {
    const testSequelize = new Sequelize(testConfig);
    await testSequelize.authenticate();
    console.log("✅ Test database connected successfully!");
    await testSequelize.close();
  } catch (error) {
    console.log("❌ Test database connection failed:", error.message);
  }
}

testConnection().catch(console.error);
