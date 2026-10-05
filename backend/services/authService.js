const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const auditService = require('./auditService');
const { ROLES, USER_STATUS } = require('../config/constants');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register a new customer
 */
const register = async ({ name, email, phone, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Check duplicate email
  const existingUsers = await db.query('SELECT id FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
  if (existingUsers.length > 0) {
    const error = new Error('An account with this email address already exists');
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const result = await db.query(
    `INSERT INTO users (name, email, phone, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)`,
    [name.trim(), normalizedEmail, phone.trim(), passwordHash, ROLES.CUSTOMER, USER_STATUS.ACTIVE]
  );

  const userId = result.insertId;

  // Generate JWT
  const token = jwt.sign(
    { id: userId, email: normalizedEmail, name: name.trim(), role: ROLES.CUSTOMER },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  await auditService.logAction({
    userId,
    action: 'USER_REGISTER',
    entityType: 'USER',
    entityId: userId,
    description: `Customer account registered: ${normalizedEmail}`
  });

  return {
    user: {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      role: ROLES.CUSTOMER,
      status: USER_STATUS.ACTIVE
    },
    token
  };
};

/**
 * Login user (Customer or Admin)
 */
const login = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const users = await db.query('SELECT * FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
  if (users.length === 0) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const user = users[0];

  if (user.status !== USER_STATUS.ACTIVE) {
    const error = new Error('Your account has been deactivated. Please contact support.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  await auditService.logAction({
    userId: user.id,
    action: user.role === ROLES.ADMIN ? 'ADMIN_LOGIN' : 'USER_LOGIN',
    entityType: 'USER',
    entityId: user.id,
    description: `${user.role} logged in: ${user.email}`
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    },
    token
  };
};

/**
 * Get user profile by ID
 */
const getProfile = async (userId) => {
  const users = await db.query('SELECT id, name, email, phone, role, status, created_at FROM users WHERE id = ?', [userId]);
  if (users.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return users[0];
};

/**
 * Update user profile
 */
const updateProfile = async (userId, { name, phone }) => {
  if (!name || !name.trim()) {
    const error = new Error('Name cannot be empty');
    error.statusCode = 400;
    throw error;
  }
  if (!phone || !phone.trim()) {
    const error = new Error('Phone cannot be empty');
    error.statusCode = 400;
    throw error;
  }

  await db.query('UPDATE users SET name = ?, phone = ? WHERE id = ?', [name.trim(), phone.trim(), userId]);

  return getProfile(userId);
};

/**
 * Change user password
 */
const changePassword = async (userId, { currentPassword, newPassword, confirmPassword }) => {
  if (!currentPassword || !newPassword) {
    const error = new Error('Current and new passwords are required');
    error.statusCode = 400;
    throw error;
  }

  if (newPassword.length < 6) {
    const error = new Error('New password must be at least 6 characters');
    error.statusCode = 400;
    throw error;
  }

  if (newPassword !== confirmPassword) {
    const error = new Error('New password confirmation does not match');
    error.statusCode = 400;
    throw error;
  }

  const users = await db.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
  if (users.length === 0) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(currentPassword, users[0].password_hash);
  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const newHash = await bcrypt.hash(newPassword, salt);

  await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

  await auditService.logAction({
    userId,
    action: 'PASSWORD_CHANGED',
    entityType: 'USER',
    entityId: userId,
    description: 'User updated their password'
  });

  return { message: 'Password updated successfully' };
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
};
