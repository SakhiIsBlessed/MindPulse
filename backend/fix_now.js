const mysql = require('mysql2/promise');
require('dotenv').config();

async function fix() {
    console.log('--- Database Repair Script ---');
    console.log('Using DB:', process.env.DB_NAME);
    
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'mindpulse',
            port: parseInt(process.env.DB_PORT) || 3306
        });
        console.log('✅ Connected to MySQL.');

        const sqls = [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS resetOTP VARCHAR(191) NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS resetOTPExpiry DATETIME NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS resetTokenExpiry DATETIME NULL",
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_alert_enabled TINYINT(1) NOT NULL DEFAULT 0",
            "ALTER TABLE emergency_contacts ADD COLUMN IF NOT EXISTS email VARCHAR(191) NOT NULL",
            "ALTER TABLE emergency_contacts ADD COLUMN IF NOT EXISTS email_verified TINYINT(1) DEFAULT 0",
            "ALTER TABLE emergency_contacts ADD COLUMN IF NOT EXISTS verification_token VARCHAR(191) NULL"
        ];

        for (const sql of sqls) {
            console.log(`Executing: ${sql}`);
            try {
                await conn.query(sql);
                console.log('✅ Success.');
            } catch (e) {
                if (e.code === 'ER_DUP_COLUMN_NAME' || e.message.includes('Duplicate column name')) {
                   console.log('ℹ️ Column already exists.');
                } else {
                   console.error(`❌ Error: ${e.message}`);
                }
            }
        }

        await conn.end();
        console.log('\n--- ALL UPDATES APPLIED ---');
    } catch (err) {
        console.error('\n❌ CRITICAL ERROR:', err.message);
    } finally {
        process.exit();
    }
}

fix();
