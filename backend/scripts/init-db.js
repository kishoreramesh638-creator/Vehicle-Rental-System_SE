require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function runInit() {
  console.log('🔄 Initializing database schema...');
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'vehicle_rental_db';

  try {
    const connection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${database}\``);

    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    await connection.query(schemaSql);
    console.log(`✅ Schema created successfully in MySQL database "${database}".`);
    await connection.end();
  } catch (err) {
    console.error(`⚠️ MySQL init failed: ${err.message}.`);
    console.log('Note: If running without local MySQL, the system automatically uses embedded SQLite.');
  }
}

runInit();
