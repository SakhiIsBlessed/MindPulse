const { Sequelize } = require('sequelize');
const nodemailer = require('nodemailer');
require('dotenv').config();

const diagnose = async () => {
  console.log('--- MindPulse Diagnostics ---');

  // 1. Check DB
  console.log('\n1. Checking Database Connection...');
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'mindpulse',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      retry: { max: 1 }
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Connected successfully.');
  } catch (err) {
    console.error('❌ MySQL Connection Failed:', err.message);
  } finally {
    await sequelize.close();
  }

  // 2. Check SMTP (with timeout)
  console.log('\n2. Checking SMTP Connection (with 10s timeout)...');
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP Connection successful.');
  } catch (err) {
    console.error('❌ SMTP Connection Failed or Timed Out:', err.message);
    console.log('Tip: Check if port 465 is blocked or if your App Password is correct.');
  }

  console.log('\n--- Diagnostics Complete ---');
};

diagnose();
