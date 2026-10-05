const db = require('../config/db');
const { BOOKING_STATUS, PAYMENT_STATUS, VEHICLE_STATUS, DEFAULT_SECURITY_DEPOSITS, ROLES } = require('../config/constants');
const { validateBookingDates, calculateRentalDays, isBookingOverdue } = require('../utils/dateUtils');
const { generateBookingReference } = require('../utils/referenceGenerator');
const auditService = require('./auditService');

/**
 * Create a new booking (Customer)
 */
const createBooking = async ({ userId, vehicleId, pickupDate, returnDate, pickupLocation, returnLocation }) => {
  // 1. Validate dates
  const dateCheck = validateBookingDates(pickupDate, returnDate);
  if (!dateCheck.valid) {
    const error = new Error(dateCheck.message);
    error.statusCode = 400;
    throw error;
  }

  if (!pickupLocation || !pickupLocation.trim()) {
    const error = new Error('Pickup location is required');
    error.statusCode = 400;
    throw error;
  }

  const finalReturnLocation = returnLocation && returnLocation.trim() ? returnLocation.trim() : pickupLocation.trim();

  // 2. Query vehicle from DB (truth source)
  const vehicles = await db.query('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);
  if (vehicles.length === 0) {
    const error = new Error('Vehicle not found');
    error.statusCode = 404;
    throw error;
  }

  const vehicle = vehicles[0];

  if (vehicle.status === VEHICLE_STATUS.MAINTENANCE) {
    const error = new Error('Vehicle is currently under maintenance and cannot be reserved');
    error.statusCode = 400;
    throw error;
  }

  if (vehicle.status === VEHICLE_STATUS.INACTIVE) {
    const error = new Error('Vehicle is inactive and cannot be reserved');
    error.statusCode = 400;
    throw error;
  }

  // 3. Strict overlap check (race condition prevention)
  const overlaps = await db.query(
    `SELECT id, booking_reference FROM bookings
     WHERE vehicle_id = ?
       AND booking_status IN ('PENDING', 'CONFIRMED', 'ACTIVE', 'OVERDUE')
       AND pickup_date < ?
       AND return_date > ?`,
    [vehicleId, returnDate, pickupDate]
  );

  if (overlaps.length > 0) {
    const error = new Error('Vehicle is not available for the selected dates. Please choose different dates.');
    error.statusCode = 409;
    throw error;
  }

  // 4. Calculate prices on the backend
  const days = calculateRentalDays(pickupDate, returnDate);
  const pricePerDay = Number(vehicle.price_per_day);
  const subtotal = days * pricePerDay;
  const securityDeposit = Number(vehicle.security_deposit || DEFAULT_SECURITY_DEPOSITS[vehicle.category] || 5000);
  const totalAmount = subtotal + securityDeposit;

  // 5. Generate unique reference
  let bookingReference = generateBookingReference();
  let attempts = 0;
  while (attempts < 5) {
    const existing = await db.query('SELECT id FROM bookings WHERE booking_reference = ?', [bookingReference]);
    if (existing.length === 0) break;
    bookingReference = generateBookingReference();
    attempts++;
  }

  // 6. Insert booking
  const insertResult = await db.query(
    `INSERT INTO bookings (
      booking_reference, user_id, vehicle_id, pickup_date, return_date,
      pickup_location, return_location, number_of_days, price_per_day,
      subtotal, security_deposit, total_amount, booking_status, payment_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      bookingReference,
      userId,
      vehicleId,
      pickupDate,
      returnDate,
      pickupLocation.trim(),
      finalReturnLocation,
      days,
      pricePerDay,
      subtotal,
      securityDeposit,
      totalAmount,
      BOOKING_STATUS.PENDING,
      PAYMENT_STATUS.PENDING
    ]
  );

  const bookingId = insertResult.insertId;

  await auditService.logAction({
    userId,
    action: 'BOOKING_CREATED',
    entityType: 'BOOKING',
    entityId: bookingReference,
    description: `Booking ${bookingReference} created for vehicle ${vehicle.brand} ${vehicle.model} (${days} days, ₹${totalAmount})`
  });

  return getBookingById(bookingId);
};

/**
 * Get detailed booking by ID
 */
const getBookingById = async (id, currentUser = null) => {
  const sql = `
    SELECT b.*,
           v.brand, v.model, v.category, v.vehicle_number, v.fuel_type, v.transmission, 
           v.image_url, v.seating_capacity, v.location as vehicle_location,
           u.name as customer_name, u.email as customer_email, u.phone as customer_phone
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    JOIN users u ON b.user_id = u.id
    WHERE b.id = ? OR b.booking_reference = ?
  `;

  const rows = await db.query(sql, [id, id]);
  if (rows.length === 0) {
    const error = new Error('Booking not found');
    error.statusCode = 404;
    throw error;
  }

  const booking = rows[0];

  // Authorization check: Customer can only view their own booking
  if (currentUser && currentUser.role !== ROLES.ADMIN && booking.user_id !== currentUser.id) {
    const error = new Error('Access denied. You do not own this booking.');
    error.statusCode = 403;
    throw error;
  }

  // Dynamic overdue status flag
  if (booking.booking_status === BOOKING_STATUS.ACTIVE && isBookingOverdue(booking)) {
    booking.is_overdue = true;
  } else {
    booking.is_overdue = false;
  }

  // Fetch payments for this booking
  const payments = await db.query(
    'SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC',
    [booking.id]
  );
  booking.payments = payments;

  // Fetch rental record if exists
  const rentalRecords = await db.query(
    'SELECT * FROM rental_records WHERE booking_id = ?',
    [booking.id]
  );
  booking.rental_record = rentalRecords.length > 0 ? rentalRecords[0] : null;

  return booking;
};

/**
 * Get customer's own bookings
 */
const getCustomerBookings = async (userId, filterStatus = null) => {
  let sql = `
    SELECT b.*,
           v.brand, v.model, v.category, v.vehicle_number, v.fuel_type, v.transmission, 
           v.image_url, v.seating_capacity, v.location as vehicle_location
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.user_id = ?
  `;
  const params = [userId];

  if (filterStatus && filterStatus !== 'All') {
    sql += ` AND b.booking_status = ?`;
    params.push(filterStatus);
  }

  sql += ` ORDER BY b.created_at DESC`;

  const rows = await db.query(sql, params);

  return rows.map(b => ({
    ...b,
    is_overdue: b.booking_status === BOOKING_STATUS.ACTIVE && isBookingOverdue(b)
  }));
};

/**
 * Cancel a booking (Customer or Admin)
 */
const cancelBooking = async (id, currentUser, reason = 'Cancelled by customer') => {
  const booking = await getBookingById(id, currentUser);

  // Business rules for cancellation
  if (booking.booking_status === BOOKING_STATUS.COMPLETED) {
    const error = new Error('Completed rentals cannot be cancelled');
    error.statusCode = 400;
    throw error;
  }

  if (booking.booking_status === BOOKING_STATUS.ACTIVE) {
    const error = new Error('Active rentals in progress cannot be cancelled directly. Please complete the return process.');
    error.statusCode = 400;
    throw error;
  }

  if (booking.booking_status === BOOKING_STATUS.CANCELLED) {
    const error = new Error('Booking is already cancelled');
    error.statusCode = 400;
    throw error;
  }

  if (booking.booking_status === BOOKING_STATUS.REJECTED) {
    const error = new Error('Booking was already rejected');
    error.statusCode = 400;
    throw error;
  }

  // Update status to CANCELLED
  let newPaymentStatus = booking.payment_status;
  if (booking.payment_status === PAYMENT_STATUS.PAID) {
    newPaymentStatus = PAYMENT_STATUS.REFUNDED;
  }

  await db.query(
    `UPDATE bookings SET booking_status = ?, payment_status = ? WHERE id = ?`,
    [BOOKING_STATUS.CANCELLED, newPaymentStatus, booking.id]
  );

  // If payment was paid, create a refund entry in payments table
  if (booking.payment_status === PAYMENT_STATUS.PAID) {
    const isMysql = db.getDriver() === 'mysql';
    const refundSql = isMysql
      ? `INSERT INTO payments (booking_id, amount, payment_method, transaction_reference, payment_status, paid_at, created_at)
         VALUES (?, ?, 'Card', ?, 'REFUNDED', NOW(), NOW())`
      : `INSERT INTO payments (booking_id, amount, payment_method, transaction_reference, payment_status, paid_at, created_at)
         VALUES (?, ?, 'Card', ?, 'REFUNDED', datetime('now'), datetime('now'))`;
    
    await db.query(refundSql, [
      booking.id,
      booking.total_amount,
      `REFUND-${Date.now()}`
    ]);
  }

  await auditService.logAction({
    userId: currentUser.id,
    action: 'BOOKING_CANCELLED',
    entityType: 'BOOKING',
    entityId: booking.booking_reference,
    description: `Booking ${booking.booking_reference} cancelled by ${currentUser.role}. Reason: ${reason}`
  });

  return getBookingById(booking.id);
};

/**
 * Admin: Get all bookings with filtering & search
 */
const getAllBookingsAdmin = async (query = {}) => {
  let sql = `
    SELECT b.*,
           v.brand, v.model, v.category, v.vehicle_number, v.fuel_type, v.transmission, 
           v.image_url, v.location as vehicle_location,
           u.name as customer_name, u.email as customer_email, u.phone as customer_phone
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    JOIN users u ON b.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  // Filter by status
  if (query.status && query.status !== 'All') {
    if (query.status === 'OVERDUE') {
      sql += ` AND b.booking_status = 'ACTIVE'`;
    } else {
      sql += ` AND b.booking_status = ?`;
      params.push(query.status);
    }
  }

  // Filter by payment status
  if (query.payment_status && query.payment_status !== 'All') {
    sql += ` AND b.payment_status = ?`;
    params.push(query.payment_status);
  }

  // Search keyword (reference, customer name, customer email, vehicle)
  if (query.search && query.search.trim()) {
    const term = `%${query.search.trim()}%`;
    sql += ` AND (
      LOWER(b.booking_reference) LIKE LOWER(?) OR
      LOWER(u.name) LIKE LOWER(?) OR
      LOWER(u.email) LIKE LOWER(?) OR
      LOWER(v.brand) LIKE LOWER(?) OR
      LOWER(v.model) LIKE LOWER(?) OR
      LOWER(v.vehicle_number) LIKE LOWER(?)
    )`;
    params.push(term, term, term, term, term, term);
  }

  // Date filters
  if (query.dateFrom) {
    sql += ` AND b.pickup_date >= ?`;
    params.push(query.dateFrom);
  }
  if (query.dateTo) {
    sql += ` AND b.return_date <= ?`;
    params.push(query.dateTo);
  }

  sql += ` ORDER BY b.created_at DESC`;

  let rows = await db.query(sql, params);

  rows = rows.map(b => {
    const overdue = b.booking_status === BOOKING_STATUS.ACTIVE && isBookingOverdue(b);
    return {
      ...b,
      is_overdue: overdue,
      // If overdue filter was specifically requested, highlight
      effective_status: overdue ? 'OVERDUE' : b.booking_status
    };
  });

  if (query.status === 'OVERDUE') {
    rows = rows.filter(b => b.is_overdue);
  }

  return rows;
};

/**
 * Admin: Update booking status (Confirm, Reject, Cancel)
 */
const updateBookingStatusAdmin = async (id, newStatus, adminId, reason = '') => {
  const booking = await getBookingById(id);

  const allowedTransitions = {
    [BOOKING_STATUS.PENDING]: [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.REJECTED, BOOKING_STATUS.CANCELLED],
    [BOOKING_STATUS.CONFIRMED]: [BOOKING_STATUS.ACTIVE, BOOKING_STATUS.CANCELLED],
    [BOOKING_STATUS.ACTIVE]: [BOOKING_STATUS.COMPLETED],
    [BOOKING_STATUS.OVERDUE]: [BOOKING_STATUS.COMPLETED]
  };

  const validNext = allowedTransitions[booking.booking_status] || [];
  if (!validNext.includes(newStatus)) {
    const error = new Error(`Cannot transition booking from ${booking.booking_status} to ${newStatus}`);
    error.statusCode = 400;
    throw error;
  }

  await db.query('UPDATE bookings SET booking_status = ? WHERE id = ?', [newStatus, booking.id]);

  await auditService.logAction({
    userId: adminId,
    action: `BOOKING_${newStatus}`,
    entityType: 'BOOKING',
    entityId: booking.booking_reference,
    description: `Admin updated booking ${booking.booking_reference} status from ${booking.booking_status} to ${newStatus}. ${reason}`
  });

  return getBookingById(booking.id);
};

module.exports = {
  createBooking,
  getBookingById,
  getCustomerBookings,
  cancelBooking,
  getAllBookingsAdmin,
  updateBookingStatusAdmin
};
