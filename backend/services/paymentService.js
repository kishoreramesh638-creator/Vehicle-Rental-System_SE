const db = require('../config/db');
const { PAYMENT_STATUS, PAYMENT_METHODS, BOOKING_STATUS, ROLES } = require('../config/constants');
const { generateTransactionReference } = require('../utils/referenceGenerator');
const auditService = require('./auditService');
const bookingService = require('./bookingService');

/**
 * Process a simulated payment for a booking
 */
const processPayment = async ({ bookingId, user, paymentMethod, simulateSuccess = true, notes = '' }) => {
  const booking = await bookingService.getBookingById(bookingId, user);

  if (!Object.values(PAYMENT_METHODS).includes(paymentMethod)) {
    const error = new Error(`Invalid payment method. Allowed methods: ${Object.values(PAYMENT_METHODS).join(', ')}`);
    error.statusCode = 400;
    throw error;
  }

  if (booking.payment_status === PAYMENT_STATUS.PAID) {
    const error = new Error('This booking is already marked as PAID');
    error.statusCode = 400;
    throw error;
  }

  if (booking.booking_status === BOOKING_STATUS.CANCELLED || booking.booking_status === BOOKING_STATUS.REJECTED) {
    const error = new Error(`Cannot pay for a ${booking.booking_status} booking`);
    error.statusCode = 400;
    throw error;
  }

  // Simulate payment gateway failure if requested
  if (simulateSuccess === false || simulateSuccess === 'false') {
    const failedRef = generateTransactionReference('FAIL');
    const isMysql = db.getDriver() === 'mysql';
    const failedSql = isMysql
      ? `INSERT INTO payments (booking_id, amount, payment_method, transaction_reference, payment_status, created_at)
         VALUES (?, ?, ?, ?, 'FAILED', NOW())`
      : `INSERT INTO payments (booking_id, amount, payment_method, transaction_reference, payment_status, created_at)
         VALUES (?, ?, ?, ?, 'FAILED', datetime('now'))`;

    await db.query(failedSql, [booking.id, booking.total_amount, paymentMethod, failedRef]);
    await db.query('UPDATE bookings SET payment_status = ? WHERE id = ?', [PAYMENT_STATUS.FAILED, booking.id]);

    await auditService.logAction({
      userId: user.id,
      action: 'PAYMENT_FAILED',
      entityType: 'PAYMENT',
      entityId: failedRef,
      description: `Payment simulation failed for booking ${booking.booking_reference} via ${paymentMethod}`
    });

    const error = new Error('Payment declined by simulated banking network. Please check details or retry.');
    error.statusCode = 402;
    throw error;
  }

  // Success simulation
  const prefix = paymentMethod === PAYMENT_METHODS.UPI ? 'UPI' : (paymentMethod === PAYMENT_METHODS.CARD ? 'CARD' : 'CASH');
  const transactionRef = generateTransactionReference(prefix);

  const isMysql = db.getDriver() === 'mysql';
  const successSql = isMysql
    ? `INSERT INTO payments (booking_id, amount, payment_method, transaction_reference, payment_status, paid_at, created_at)
       VALUES (?, ?, ?, ?, 'PAID', NOW(), NOW())`
    : `INSERT INTO payments (booking_id, amount, payment_method, transaction_reference, payment_status, paid_at, created_at)
       VALUES (?, ?, ?, ?, 'PAID', datetime('now'), datetime('now'))`;

  await db.query(successSql, [booking.id, booking.total_amount, paymentMethod, transactionRef]);

  // Update booking payment status and auto-confirm if PENDING
  let newBookingStatus = booking.booking_status;
  if (booking.booking_status === BOOKING_STATUS.PENDING) {
    newBookingStatus = BOOKING_STATUS.CONFIRMED;
  }

  await db.query(
    'UPDATE bookings SET payment_status = ?, booking_status = ? WHERE id = ?',
    [PAYMENT_STATUS.PAID, newBookingStatus, booking.id]
  );

  await auditService.logAction({
    userId: user.id,
    action: 'PAYMENT_SUCCESS',
    entityType: 'PAYMENT',
    entityId: transactionRef,
    description: `Paid ₹${booking.total_amount} for booking ${booking.booking_reference} via ${paymentMethod}. Ref: ${transactionRef}`
  });

  return {
    payment: {
      transaction_reference: transactionRef,
      amount: booking.total_amount,
      payment_method: paymentMethod,
      payment_status: PAYMENT_STATUS.PAID,
      paid_at: new Date().toISOString()
    },
    booking: await bookingService.getBookingById(booking.id)
  };
};

/**
 * Get payment history for a booking
 */
const getPaymentsForBooking = async (bookingId, user) => {
  const booking = await bookingService.getBookingById(bookingId, user);
  const rows = await db.query('SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC', [booking.id]);
  return rows;
};

module.exports = {
  processPayment,
  getPaymentsForBooking
};
