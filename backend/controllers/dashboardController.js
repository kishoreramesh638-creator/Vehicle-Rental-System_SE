const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/responseHandler');

const getAdminDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getAdminDashboardStats();
    return sendSuccess(res, 'Admin dashboard statistics retrieved', { stats });
  } catch (err) {
    next(err);
  }
};

const getCustomerDashboard = async (req, res, next) => {
  try {
    const stats = await dashboardService.getCustomerDashboardStats(req.user.id);
    return sendSuccess(res, 'Customer dashboard statistics retrieved', { stats });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminDashboard,
  getCustomerDashboard
};
