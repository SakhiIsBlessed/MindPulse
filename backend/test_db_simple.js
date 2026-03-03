const mysql = require('mysql2/promise');
require('dotenv').config();

const test = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'mindpulse',
      port: process.env.DB_PORT || 3306
    });
    console.log('✅ Connection Successful');
    const [rows] = await connection.query('SELECT 1 + 1 AS result');
    console.log('Result:', rows[0].result);
    await connection.end();
  } catch (err) {
    console.error('❌ Connection Failed:', err.message);
  }
};
test();
