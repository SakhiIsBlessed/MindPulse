const { Sequelize } = require('sequelize');
require('dotenv').config();

const sync = async () => {
    const dbName = process.env.DB_NAME || 'mindpulse';
    console.log(`--- Emergency Schema Sync ---`);
    console.log(`Connected DB: ${dbName}`);

    const sequelize = new Sequelize(
        dbName,
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || 'root',
        {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            dialect: 'mysql',
            logging: false,
        }
    );

    try {
        await sequelize.authenticate();
        console.log('✅ Connected to MySQL successfully.');

        // 1. Check current database
        const [dbResult] = await sequelize.query('SELECT DATABASE() as db');
        console.log(`Active Database: ${dbResult[0].db}`);

        if (dbResult[0].db !== dbName) {
            console.error(`❌ ERROR: Connected to ${dbResult[0].db} but expected ${dbName}`);
        }

        // 2. Add columns to emergency_contacts
        console.log('\nUpdating emergency_contacts table...');
        try {
            await sequelize.query(`
                ALTER TABLE emergency_contacts 
                ADD COLUMN email VARCHAR(255) NOT NULL AFTER name,
                ADD COLUMN email_verified TINYINT(1) DEFAULT 0 AFTER email,
                ADD COLUMN verification_token VARCHAR(255) NULL AFTER email_verified
            `);
            console.log('✅ emergency_contacts updated successfully.');
        } catch (err) {
            if (err.message.includes('Duplicate column name')) {
                console.log('ℹ️ emergency_contacts columns already exist.');
            } else {
                console.error(`❌ Error updating emergency_contacts: ${err.message}`);
            }
        }

        // 3. Add columns to users
        console.log('\nUpdating users table...');
        try {
            await sequelize.query(`
                ALTER TABLE users
                ADD COLUMN emergency_alert_enabled TINYINT(1) DEFAULT 0 AFTER resetTokenExpiry
            `);
            console.log('✅ users updated successfully.');
        } catch (err) {
            if (err.message.includes('Duplicate column name')) {
                console.log('ℹ️ users column already exists.');
            } else {
                console.error(`❌ Error updating users: ${err.message}`);
            }
        }

        // 4. Verify
        console.log('\n--- Verification ---');
        const [describeContacts] = await sequelize.query('DESCRIBE emergency_contacts');
        console.log('Table: emergency_contacts');
        console.table(describeContacts.map(f => ({ Field: f.Field, Type: f.Type })));

        const [describeUsers] = await sequelize.query('DESCRIBE users');
        console.log('\nTable: users');
        console.table(describeUsers.map(f => ({ Field: f.Field, Type: f.Type })));

    } catch (error) {
        console.error('❌ Critical Error:', error.message);
    } finally {
        await sequelize.close();
    }
};

sync();
