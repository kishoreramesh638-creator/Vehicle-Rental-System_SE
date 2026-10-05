const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

// Customer routes
router.post('/', authenticate, authorize(ROLES.CUSTOMER), bookingController.createBooking);
router.get('/my', authenticate, authorize(ROLES.CUSTOMER), bookingController.getMyBookings);
router.get('/:id', authenticate, bookingController.getBookingById);
router.patch('/:id/cancel', authenticate, bookingController.cancelBooking);

// Admin routes
router.get('/admin/all', authenticate, authorize(ROLES.ADMIN), bookingController.getAllBookingsAdmin);
router.patch('/admin/:id/status', authenticate, authorize(ROLES.ADMIN), bookingController.updateBookingStatusAdmin);

module.exports = router;
