const db = require('../config/db');
const { USER_STATUS } = require('../config/constants');
const auditService = require('./auditService');

/**
 * Get all customers with their booking summary (Admin only)
 */
const getAllCustomers = async (search = '') => {
  let sql = `
    SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.created_at,
           COUNT(b.id) as total_bookings,
           COALESCE(SUM(CASE WHEN b.payment_status = 'PAID' THEN b.total_amount ELSE 0 END), 0) as total_spent
    FROM users u
    LEFT JOIN bookings b ON u.id = b.user_id
    WHERE u.role = 'CUSTOMER'
  `;
  const params = [];

  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    sql += ` AND (LOWER(u.name) LIKE LOWER(?) OR LOWER(u.email) LIKE LOWER(?) OR LOWER(u.phone) LIKE LOWER(?))`;
    params.push(term, term, term);
  }

  sql += ` GROUP BY u.id, u.name, u.email, u.phone, u.role, u.status, u.created_at ORDER BY u.created_at DESC`;

  const rows = await db.query(sql, params);
  return rows;
};

/**
 * Get customer by ID with their bookings (Admin only)
 */
const getCustomerById = async (id) => {
  const users = await db.query(
    'SELECT id, name, email, phone, role, status, created_at FROM users WHERE id = ? AND role = "CUSTOMER"',
    [id]
  );

  if (users.length === 0) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  const customer = users[0];

  const bookings = await db.query(
    `SELECT b.*, v.brand, v.model, v.vehicle_number, v.category
     FROM bookings b
     JOIN vehicles v ON b.vehicle_id = v.id
     WHERE b.user_id = ?
     ORDER BY b.created_at DESC`,
    [id]
  );

  customer.bookings = bookings;
  return customer;
};

/**
 * Toggle customer account status (ACTIVE / INACTIVE)
 */
const updateCustomerStatus = async (id, status, adminId) => {
  if (![USER_STATUS.ACTIVE, USER_STATUS.INACTIVE].includes(status)) {
    const error = new Error('Invalid status. Must be ACTIVE or INACTIVE');
    error.statusCode = 400;
    throw error;
  }

  const users = await db.query('SELECT * FROM users WHERE id = ? AND role = "CUSTOMER"', [id]);
  if (users.length === 0) {
    const error = new Error('Customer not found');
    error.statusCode = 404;
    throw error;
  }

  const customer = users[0];

  await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);

  await auditService.logAction({
    userId: adminId,
    action: 'CUSTOMER_STATUS_UPDATED',
    entityType: 'USER',
    entityId: id,
    description: `Admin changed customer ${customer.email} status to ${status}`
  });

  return getCustomerById(id);
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  updateCustomerStatus
};
