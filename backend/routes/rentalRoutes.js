const express = require('express');
const router = express.Router();
const rentalController = require('../controllers/rentalController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

// Admin-only pickup and return
router.post('/admin/:bookingId/pickup', authenticate, authorize(ROLES.ADMIN), rentalController.recordPickup);
router.post('/admin/:bookingId/return', authenticate, authorize(ROLES.ADMIN), rentalController.recordReturn);
router.get('/:bookingId/record', authenticate, rentalController.getRentalRecord);

module.exports = router;
