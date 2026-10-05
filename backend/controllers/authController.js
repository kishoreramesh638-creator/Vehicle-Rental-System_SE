const authService = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const result = await authService.register({ name, email, phone, password });
    return sendSuccess(res, 'Registration successful. Welcome to DriveEase!', result, 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return sendSuccess(res, 'Login successful', result);
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return sendSuccess(res, 'User profile fetched', { user });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const user = await authService.updateProfile(req.user.id, { name, phone });
    return sendSuccess(res, 'Profile updated successfully', { user });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const result = await authService.changePassword(req.user.id, {
      currentPassword,
      newPassword,
      confirmPassword
    });
    return sendSuccess(res, result.message);
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res) => {
  // Stateless JWT logout is handled on client by discarding token
  return sendSuccess(res, 'Logged out successfully');
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  logout
};
