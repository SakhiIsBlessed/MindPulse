const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

const logFile = 'repair_debug.log';
function log(msg) {
    const time = new Date().toISOString();
    const entry = `[${time}] ${msg}\n`;
    fs.appendFileSync(logFile, entry);
    console.log(msg);
}

async function fix() {
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
    log('--- STARTING REPAIR WITH PERSISTENT LOGS ---');
    
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'mindpulse',
        port: parseInt(process.env.DB_PORT) || 3306,
        connectTimeout: 10000
    };

    log(`Config: ${JSON.stringify({...config, password: '****'})}`);

    let conn;
    try {
        log('Connecting...');
        conn = await mysql.createConnection(config);
        log('✅ Connected.');

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
            log(`Executing: ${sql}`);
            try {
                await conn.query(sql);
                log('✅ Success.');
            } catch (e) {
                log(`❌ Error: ${e.message}`);
            }
        }
        
        log('--- FINISHED ---');
    } catch (err) {
        log(`❌ CRITICAL ERROR: ${err.message}`);
    } finally {
        if (conn) await conn.end();
        process.exit();
    }
}

fix();
