const mysql = require('mysql2/promise');
require('dotenv').config();

async function fix() {
  console.log('Direct Repair Start...');
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'mindpulse',
    port: parseInt(process.env.DB_PORT) || 3306
  };
  
  try {
    const conn = await mysql.createConnection(config);
    console.log('Connected.');

    const queries = [
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS resetOTP VARCHAR(191) NULL",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS resetOTPExpiry DATETIME NULL",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS resetTokenExpiry DATETIME NULL",
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_alert_enabled TINYINT(1) NOT NULL DEFAULT 0",
      "ALTER TABLE emergency_contacts ADD COLUMN IF NOT EXISTS email VARCHAR(191) NOT NULL",
      "ALTER TABLE emergency_contacts ADD COLUMN IF NOT EXISTS email_verified TINYINT(1) DEFAULT 0",
      "ALTER TABLE emergency_contacts ADD COLUMN IF NOT EXISTS verification_token VARCHAR(191) NULL"
    ];

    for (const sql of queries) {
      try {
        await conn.query(sql);
        console.log(`Success: ${sql.substring(0, 50)}...`);
      } catch (e) {
        if (e.code === 'ER_DUP_COLUMN_NAME' || e.message.includes('Duplicate column')) {
          console.log(`Column already exists: ${sql.substring(0, 50)}...`);
        } else {
          console.error(`Failed: ${sql.substring(0, 50)}... - ${e.message}`);
        }
      }
    }
    
    await conn.end();
    console.log('Repair Finished successfully.');
  } catch (err) {
    console.error('Connection failed:', err.message);
  } finally {
    process.exit();
  }
}

fix();
