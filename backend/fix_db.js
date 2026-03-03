const { sequelize } = require('./config/db');
require('dotenv').config();

const fixDb = async () => {
  console.log('--- STARTING DATABASE REPAIR ---');
  try {
    console.log('Authenticating...');
    await sequelize.authenticate();
    console.log('✅ MySQL Connected.');

    const tables = [
      {
        name: 'users',
        columns: [
          { name: 'resetOTP', type: 'VARCHAR(191) NULL' },
          { name: 'resetOTPExpiry', type: 'DATETIME NULL' },
          { name: 'resetTokenExpiry', type: 'DATETIME NULL' },
          { name: 'emergency_alert_enabled', type: 'TINYINT(1) NOT NULL DEFAULT 0' }
        ]
      },
      {
        name: 'emergency_contacts',
        columns: [
          { name: 'email', type: 'VARCHAR(191) NOT NULL' },
          { name: 'email_verified', type: 'TINYINT(1) DEFAULT 0' },
          { name: 'verification_token', type: 'VARCHAR(191) NULL' }
        ]
      }
    ];

    for (const table of tables) {
      console.log(`\nChecking table: ${table.name}`);
      const [results] = await sequelize.query(`DESCRIBE ${table.name}`);
      const existingFields = results.map(r => r.Field);
      
      for (const col of table.columns) {
        if (!existingFields.includes(col.name)) {
          console.log(`Adding ${col.name} to ${table.name}...`);
          await sequelize.query(`ALTER TABLE ${table.name} ADD COLUMN ${col.name} ${col.type}`);
          console.log(`✅ Success.`);
        } else {
          console.log(`Column ${col.name} already exists.`);
        }
      }
    }

    console.log('\n--- REPAIR COMPLETE ---');
  } catch (err) {
    console.error('\n❌ REPAIR FAILED:', err.message);
  } finally {
    process.exit();
  }
};

fixDb();
