const mysql = require('mysql2/promise');
require('dotenv').config();

const fixDbDirect = async () => {
  console.log('--- Direct MySQL Schema Fix Utility ---');
  
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'mindpulse',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('Connected to MySQL directly.');

    // 1. Fix users table
    console.log('\nRepairing users table...');
    const [userCols] = await connection.query('DESCRIBE users');
    const userFieldNames = userCols.map(c => c.Field);
    
    const userFixes = [
      { name: 'resetOTP', sql: 'ALTER TABLE users ADD COLUMN resetOTP VARCHAR(191) NULL' },
      { name: 'resetOTPExpiry', sql: 'ALTER TABLE users ADD COLUMN resetOTPExpiry DATETIME NULL' },
      { name: 'resetTokenExpiry', sql: 'ALTER TABLE users ADD COLUMN resetTokenExpiry DATETIME NULL' },
      { name: 'emergency_alert_enabled', sql: 'ALTER TABLE users ADD COLUMN emergency_alert_enabled TINYINT(1) NOT NULL DEFAULT 0' }
    ];

    for (const fix of userFixes) {
      if (!userFieldNames.includes(fix.name)) {
        console.log(`Adding ${fix.name} to users...`);
        await connection.query(fix.sql);
        console.log(`✅ Success.`);
      } else {
        console.log(`Column ${fix.name} already exists in users.`);
      }
    }

    // 2. Fix emergency_contacts table
    console.log('\nRepairing emergency_contacts table...');
    const [contactCols] = await connection.query('DESCRIBE emergency_contacts');
    const contactFieldNames = contactCols.map(c => c.Field);

    const contactFixes = [
      { name: 'email', sql: 'ALTER TABLE emergency_contacts ADD COLUMN email VARCHAR(191) NOT NULL' },
      { name: 'email_verified', sql: 'ALTER TABLE emergency_contacts ADD COLUMN email_verified TINYINT(1) DEFAULT 0' },
      { name: 'verification_token', sql: 'ALTER TABLE emergency_contacts ADD COLUMN verification_token VARCHAR(191) NULL' }
    ];

    for (const fix of contactFixes) {
      if (!contactFieldNames.includes(fix.name)) {
        console.log(`Adding ${fix.name} to emergency_contacts...`);
        await connection.query(fix.sql);
        console.log(`✅ Success.`);
      } else {
        console.log(`Column ${fix.name} already exists in emergency_contacts.`);
      }
    }

    console.log('\n--- Direct Fixes Completed ---');
  } catch (err) {
    console.error('\n❌ Direct fix failed:', err.message);
  } finally {
    await connection.end();
    process.exit();
  }
};

fixDbDirect();
