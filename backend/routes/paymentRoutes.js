const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/', authenticate, paymentController.processPayment);
router.get('/:bookingId', authenticate, paymentController.getBookingPayments);

module.exports = router;
