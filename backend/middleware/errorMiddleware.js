const { sendError } = require('../utils/responseHandler');

/**
 * 404 Route Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  return sendError(res, `API route not found: ${req.method} ${req.originalUrl}`, 404);
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error occurred';

  // Do not expose stack traces in responses
  return sendError(res, message, statusCode);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
