const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const logFile = path.join(__dirname, 'sync_internal.log');
function log(msg) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

async function fix() {
    if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
    log('--- EMERGENCY SYNC START ---');
    
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'mindpulse',
        port: process.env.DB_PORT || 3306
    };

    log(`Connecting to: ${config.host} DB: ${config.database}`);
    
    let connection;
    try {
        connection = await mysql.createConnection(config);
        log('✅ Connected.');

        const [dbRes] = await connection.query('SELECT DATABASE() as db');
        log(`Active DB: ${dbRes[0].db}`);

        // Emergency Contact Table
        log('\nAltering emergency_contacts...');
        try {
            await connection.query(`
                ALTER TABLE emergency_contacts 
                ADD COLUMN email VARCHAR(255) NOT NULL AFTER name,
                ADD COLUMN email_verified TINYINT(1) DEFAULT 0 AFTER email,
                ADD COLUMN verification_token VARCHAR(255) NULL AFTER email_verified
            `);
            log('✅ emergency_contacts updated successfully.');
        } catch (err) {
            log(`Query Note: ${err.message}`);
        }

        // Users Table - already exists but let's be sure
        log('\nAltering users...');
        try {
            await connection.query('ALTER TABLE users ADD COLUMN emergency_alert_enabled TINYINT(1) DEFAULT 0 AFTER resetTokenExpiry');
            log('✅ users updated successfully.');
        } catch (err) {
            log(`Query Note: ${err.message}`);
        }


        log('\n--- VERIFICATION ---');
        const [contactsDesc] = await connection.query('DESC emergency_contacts');
        log('Table: emergency_contacts\n' + JSON.stringify(contactsDesc, null, 2));
        
        const [usersDesc] = await connection.query('DESC users');
        log('Table: users\n' + JSON.stringify(usersDesc, null, 2));

    } catch (err) {
        log(`❌ ERROR: ${err.message}`);
    } finally {
        if (connection) await connection.end();
        log('\n--- SYNC END ---');
    }
}

fix();

