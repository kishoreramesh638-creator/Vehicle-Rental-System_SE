const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

// Admin-only customer management
router.get('/', authenticate, authorize(ROLES.ADMIN), customerController.getAllCustomers);
router.get('/:id', authenticate, authorize(ROLES.ADMIN), customerController.getCustomerById);
router.patch('/:id/status', authenticate, authorize(ROLES.ADMIN), customerController.updateCustomerStatus);

module.exports = router;
