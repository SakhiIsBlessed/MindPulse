const mysql = require('mysql2/promise');
require('dotenv').config();

async function tryConnect(password) {
    console.log(`Trying password: "${password}"...`);
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: password,
            database: process.env.DB_NAME || 'mindpulse',
            port: parseInt(process.env.DB_PORT) || 3306,
            connectTimeout: 5000
        });
        console.log(`✅ Success with password: "${password}"`);
        await conn.end();
        return true;
    } catch (err) {
        console.log(`❌ Failed with password: "${password}" - ${err.message}`);
        return false;
    }
}

async function start() {
    const passwords = ['', 'root', process.env.DB_PASSWORD];
    for (const pw of passwords) {
        if (await tryConnect(pw)) {
            console.log(`\nRECOMMENDED PASSWORD: "${pw}"`);
            break;
        }
    }
}

start();
