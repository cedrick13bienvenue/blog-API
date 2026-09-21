require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "cedrique13",
    database: process.env.DB_NAME || "blogdb",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
  },
  test: {
    username: process.env.TEST_USERNAME || "postgres",
    password: process.env.TEST_PASSWORD || "cedrique13",
    database: process.env.TEST_DATABASE || "blogAPI-Test",
    host: process.env.TEST_HOST || "localhost",
    port: Number(process.env.TEST_PORT) || 5432,
    dialect: "postgres",
  },
  production: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "cedrique13",
    database: process.env.DB_NAME || "blogdb",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
  },
};
