const db = require('../config/db');

/**
 * Log an action to audit_logs
 */
const logAction = async ({ userId = null, action, entityType, entityId = null, description }) => {
  try {
    const sql = `
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, description, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `;
    // For MySQL or SQLite compatibility
    const isMysql = db.getDriver() === 'mysql';
    const finalSql = isMysql
      ? `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())`
      : sql;

    await db.query(finalSql, [userId, action, entityType, entityId ? String(entityId) : null, description]);
  } catch (err) {
    console.error('Audit log write error:', err.message);
  }
};

/**
 * Fetch audit logs with filtering and pagination
 */
const getAuditLogs = async ({ limit = 50, offset = 0, entityType, action }) => {
  let sql = `
    SELECT a.*, u.name as user_name, u.email as user_email, u.role as user_role
    FROM audit_logs a
    LEFT JOIN users u ON a.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (entityType) {
    sql += ` AND a.entity_type = ?`;
    params.push(entityType);
  }

  if (action) {
    sql += ` AND a.action = ?`;
    params.push(action);
  }

  sql += ` ORDER BY a.created_at DESC LIMIT ? OFFSET ?`;
  params.push(Number(limit), Number(offset));

  const rows = await db.query(sql, params);
  return rows;
};

module.exports = {
  logAction,
  getAuditLogs
};
