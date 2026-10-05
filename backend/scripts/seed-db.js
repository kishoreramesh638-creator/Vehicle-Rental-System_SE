require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function runSeed() {
  console.log('🔄 Seeding database with demo data...');
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '3306', 10);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'vehicle_rental_db';

  try {
    const connection = await mysql.createConnection({ host, port, user, password, multipleStatements: true });
    await connection.query(`USE \`${database}\``);

    const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    await connection.query(seedSql);
    console.log(`✅ Seed data inserted successfully into MySQL database "${database}".`);
    await connection.end();
  } catch (err) {
    console.error(`⚠️ MySQL seed failed: ${err.message}.`);
    console.log('Note: If running without local MySQL, the system automatically uses embedded SQLite.');
  }
}

runSeed();
