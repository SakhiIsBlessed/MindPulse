const { sequelize } = require('./config/db');
const fs = require('fs');
require('dotenv').config();

async function repair() {
    console.log('Starting Final Repair...');
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        // Repair Users
        const [userCols] = await sequelize.query('DESCRIBE users');
        const userFields = userCols.map(c => c.Field);
        if (!userFields.includes('emergency_alert_enabled')) {
            await sequelize.query('ALTER TABLE users ADD COLUMN emergency_alert_enabled TINYINT(1) NOT NULL DEFAULT 0');
            console.log('Added emergency_alert_enabled to users');
        }

        // Repair Emergency Contacts
        const [contactCols] = await sequelize.query('DESCRIBE emergency_contacts');
        const contactFields = contactCols.map(c => c.Field);
        if (!contactFields.includes('email')) {
            await sequelize.query('ALTER TABLE emergency_contacts ADD COLUMN email VARCHAR(191) NOT NULL');
            console.log('Added email to emergency_contacts');
        }
        if (!contactFields.includes('email_verified')) {
            await sequelize.query('ALTER TABLE emergency_contacts ADD COLUMN email_verified TINYINT(1) DEFAULT 0');
            console.log('Added email_verified to emergency_contacts');
        }
        if (!contactFields.includes('verification_token')) {
            await sequelize.query('ALTER TABLE emergency_contacts ADD COLUMN verification_token VARCHAR(191) NULL');
            console.log('Added verification_token to emergency_contacts');
        }

        fs.writeFileSync('db_repair_status.txt', 'SUCCESS: All columns verified/added at ' + new Date().toISOString());
        console.log('Repair Successful.');
    } catch (err) {
        console.error('Repair Failed:', err.message);
        fs.writeFileSync('db_repair_status.txt', 'FAILED: ' + err.message);
    } finally {
        process.exit();
    }
}

repair();
