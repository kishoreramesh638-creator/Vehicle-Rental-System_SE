const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/responseHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'vehicle_rental_secret_key_2026_super_secure';

/**
 * Require valid JWT authentication
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Authentication required. Please log in.', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return sendError(res, 'Session expired. Please log in again.', 401);
    }
    return sendError(res, 'Invalid authentication token.', 401);
  }
};

/**
 * Require specific user role(s)
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Access denied. You do not have permission for this resource.', 403);
    }

    next();
  };
};

/**
 * Optional authentication: if token exists, set req.user, else continue
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (e) {
      // Ignore invalid token for optional auth
    }
  }
  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  JWT_SECRET
};
