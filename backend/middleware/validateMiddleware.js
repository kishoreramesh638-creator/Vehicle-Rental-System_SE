const { sendError } = require('../utils/responseHandler');

/**
 * Basic validation helper to enforce non-empty fields and formats
 */
const validateRegister = (req, res, next) => {
  const { name, email, phone, password, confirmPassword } = req.body;

  if (!name || !name.trim()) {
    return sendError(res, 'Full name is required', 400);
  }

  if (!email || !email.trim()) {
    return sendError(res, 'Email address is required', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return sendError(res, 'Please provide a valid email address', 400);
  }

  if (!phone || !phone.trim()) {
    return sendError(res, 'Phone number is required', 400);
  }

  if (!password || password.length < 6) {
    return sendError(res, 'Password must be at least 6 characters long', 400);
  }

  if (password !== confirmPassword) {
    return sendError(res, 'Password and confirmation password do not match', 400);
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !email.trim()) {
    return sendError(res, 'Email address is required', 400);
  }
  if (!password) {
    return sendError(res, 'Password is required', 400);
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin
};
