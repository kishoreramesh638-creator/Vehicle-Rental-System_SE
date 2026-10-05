const paymentService = require('../services/paymentService');
const { sendSuccess } = require('../utils/responseHandler');

const processPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod, simulateSuccess } = req.body;
    if (!bookingId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'bookingId and paymentMethod are required'
      });
    }
    const result = await paymentService.processPayment({
      bookingId,
      user: req.user,
      paymentMethod,
      simulateSuccess
    });
    return sendSuccess(res, 'Payment processed successfully', result);
  } catch (err) {
    next(err);
  }
};

const getBookingPayments = async (req, res, next) => {
  try {
    const payments = await paymentService.getPaymentsForBooking(req.params.bookingId, req.user);
    return sendSuccess(res, 'Payments retrieved', { payments });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  processPayment,
  getBookingPayments
};
