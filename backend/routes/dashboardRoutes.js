const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

router.get('/admin', authenticate, authorize(ROLES.ADMIN), dashboardController.getAdminDashboard);
router.get('/customer', authenticate, authorize(ROLES.CUSTOMER), dashboardController.getCustomerDashboard);

module.exports = router;
