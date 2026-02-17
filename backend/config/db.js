const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'mindpulse',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Set to console.log for debugging
  }
);

const connectDB = async () => {
  try {
    // Load all models
    require('../models/User');
    require('../models/JournalEntry');
    require('../models/EmergencyContact');

    await sequelize.authenticate();
    console.log('MySQL Connected');
    // Sync models
    // Changed alter: true to false to prevent "Too many keys" error (MySQL limit 64 keys).
    // If schema updates are needed, we should use migrations or force: true (data loss warning).
    await sequelize.sync({ alter: false });
    console.log('Database synced (alter applied)');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Don't forcefully exit the process; log the error so the server can continue starting
    // and we can surface errors to logs for debugging. If DB is required, consider
    // exiting in production or retrying the connection here.
  }
};

module.exports = { sequelize, connectDB };
