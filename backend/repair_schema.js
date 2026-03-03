const { sequelize } = require('./config/db');
require('dotenv').config();

async function checkAndAddColumn(tableName, columnName, definition) {
  try {
    const [results] = await sequelize.query(`DESCRIBE ${tableName}`);
    const columns = results.map(r => r.Field);
    
    if (!columns.includes(columnName)) {
      console.log(`Adding column "${columnName}" to table "${tableName}"...`);
      await sequelize.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
      console.log(`✅ Column "${columnName}" added successfully.`);
    } else {
      console.log(`ℹ️ Column "${columnName}" already exists in table "${tableName}".`);
    }
  } catch (err) {
    console.error(`❌ Error checking/adding column "${columnName}" to "${tableName}":`, err.message);
  }
}

async function runRepair() {
  console.log('--- MindPulse Schema Repair ---');
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected.');

    // Fix Users Table
    await checkAndAddColumn('users', 'resetOTP', 'VARCHAR(191) NULL');
    await checkAndAddColumn('users', 'resetOTPExpiry', 'DATETIME NULL');
    await checkAndAddColumn('users', 'resetTokenExpiry', 'DATETIME NULL');
    await checkAndAddColumn('users', 'emergency_alert_enabled', 'TINYINT(1) NOT NULL DEFAULT 0');

    // Fix Emergency Contacts Table
    await checkAndAddColumn('emergency_contacts', 'email', 'VARCHAR(191) NOT NULL');
    await checkAndAddColumn('emergency_contacts', 'email_verified', 'TINYINT(1) DEFAULT 0');
    await checkAndAddColumn('emergency_contacts', 'verification_token', 'VARCHAR(191) NULL');

    console.log('\nFinal sanity check: Syncing models with alter: true...');
    await sequelize.sync({ alter: true });
    console.log('✅ Schema synchronization complete.');

  } catch (err) {
    console.error('❌ Critical failure during repair:', err.message);
  } finally {
    console.log('--- Repair Finished ---');
    process.exit();
  }
}

runRepair();
