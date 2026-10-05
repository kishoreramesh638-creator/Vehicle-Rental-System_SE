const mysql = require('mysql2/promise');
const { Pool: PgPool } = require('pg');
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

let dbDriver = null; // 'supabase' | 'postgres' | 'mysql' | 'sqlite'
let mysqlPool = null;
let pgPool = null;
let sqliteDb = null;
let sqliteFilePath = path.join(__dirname, '..', 'data', 'rental.sqlite');

// Ensure data folder exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Persist SQLite to disk
 */
const saveSqliteToDisk = () => {
  if (sqliteDb) {
    try {
      const data = sqliteDb.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(sqliteFilePath, buffer);
    } catch (err) {
      console.error('Error saving SQLite to disk:', err.message);
    }
  }
};

/**
 * Initialize SQLite fallback with schema and seeds
 */
const initSqlite = async () => {
  const SQL = await initSqlJs();
  if (fs.existsSync(sqliteFilePath)) {
    try {
      const fileBuffer = fs.readFileSync(sqliteFilePath);
      sqliteDb = new SQL.Database(fileBuffer);
      dbDriver = 'sqlite';
      console.log('✅ Loaded existing SQLite database from disk.');
      return;
    } catch (e) {
      console.warn('Could not read existing sqlite file, initializing fresh:', e.message);
    }
  }

  sqliteDb = new SQL.Database();
  dbDriver = 'sqlite';

  // Read schema and seed files
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sqlite.sql');
  const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  const seedSql = fs.readFileSync(seedPath, 'utf8');

  try {
    sqliteDb.run(schemaSql);
    sqliteDb.run(seedSql);
    saveSqliteToDisk();
    console.log('✅ Initialized embedded SQLite database with schema and seed data.');
  } catch (err) {
    console.error('Failed to initialize SQLite schema/seed:', err.message);
  }
};

/**
 * Initialize Database Connection
 * Supports Supabase / PostgreSQL, MySQL, and SQLite fallback
 */
const initDB = async () => {
  // 1. Supabase / PostgreSQL Check
  const pgConnectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.POSTGRES_URL;
  if (pgConnectionString || process.env.DB_CLIENT === 'postgres' || process.env.DB_CLIENT === 'supabase') {
    try {
      console.log('🔄 Connecting to Supabase / PostgreSQL database...');
      pgPool = new PgPool({
        connectionString: pgConnectionString || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD}@${process.env.DB_HOST || 'db.auevbqwytflxliaefcz.supabase.co'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'postgres'}`,
        ssl: {
          rejectUnauthorized: false
        },
        max: 10
      });

      // Test connection
      const testRes = await pgPool.query('SELECT NOW() as now');
      dbDriver = 'postgres';
      console.log('✅ Connected to Supabase / PostgreSQL successfully at', testRes.rows[0].now);
      return;
    } catch (pgError) {
      console.warn(`⚠️ Supabase / PostgreSQL connection error: ${pgError.message}`);
      console.log('Falling back to local database...');
    }
  }

  // 2. Explicit SQLite Check
  if (process.env.DB_CLIENT === 'sqlite') {
    console.log('ℹ️ DB_CLIENT is set to sqlite. Initializing SQLite...');
    await initSqlite();
    return;
  }

  // 3. MySQL Connection Attempt
  try {
    const host = process.env.DB_HOST || 'localhost';
    const port = parseInt(process.env.DB_PORT || '3306', 10);
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'vehicle_rental_db';

    const testConnection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      connectTimeout: 2000
    });

    await testConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await testConnection.end();

    mysqlPool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: true
    });

    await mysqlPool.query('SELECT 1');
    dbDriver = 'mysql';
    console.log(`✅ Connected to MySQL database "${database}" on ${host}:${port}.`);
    return;
  } catch (error) {
    // MySQL not reachable, engage SQLite fallback
    console.log('ℹ️ MySQL server not detected locally. Engaging embedded relational SQLite database for zero-config operation...');
    await initSqlite();
  }
};

/**
 * Universal Query Execution
 * Returns array of rows for SELECT or { insertId, affectedRows } for DML
 */
const query = async (sql, params = []) => {
  if (!dbDriver) {
    await initDB();
  }

  // A. Supabase / Postgres
  if (dbDriver === 'postgres') {
    let pgSql = sql;
    let paramIndex = 1;
    pgSql = pgSql.replace(/\?/g, () => `$${paramIndex++}`);

    const trimmed = pgSql.trim();
    const isInsert = /^INSERT\s+INTO/i.test(trimmed);
    const isSelect = /^SELECT/i.test(trimmed) || /^WITH/i.test(trimmed);

    if (isInsert && !/RETURNING/i.test(pgSql)) {
      pgSql += ' RETURNING id';
    }

    const safeParams = params.map(p => (p === undefined ? null : p));
    const result = await pgPool.query(pgSql, safeParams);

    if (isSelect) {
      return result.rows;
    } else {
      const insertId = result.rows && result.rows[0] ? result.rows[0].id : 0;
      return { insertId, affectedRows: result.rowCount };
    }
  }

  // B. MySQL
  if (dbDriver === 'mysql') {
    const [result] = await mysqlPool.query(sql, params);
    return result;
  }

  // C. SQLite fallback
  const trimmed = sql.trim();
  const isSelect = /^SELECT/i.test(trimmed) || /^WITH/i.test(trimmed) || /^PRAGMA/i.test(trimmed);

  if (isSelect) {
    const stmt = sqliteDb.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  } else {
    const safeParams = params.map(p => (p === undefined ? null : p));
    sqliteDb.run(sql, safeParams);

    const lastIdRes = sqliteDb.exec('SELECT last_insert_rowid() AS id, changes() AS changes');
    const insertId = lastIdRes[0]?.values[0][0] || 0;
    const affectedRows = lastIdRes[0]?.values[0][1] || 0;

    saveSqliteToDisk();
    return { insertId, affectedRows };
  }
};

module.exports = {
  initDB,
  query,
  getDriver: () => dbDriver,
  getPool: () => (dbDriver === 'postgres' ? pgPool : mysqlPool)
};
