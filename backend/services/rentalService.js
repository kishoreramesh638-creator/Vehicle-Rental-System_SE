const db = require('../config/db');
const { BOOKING_STATUS, VEHICLE_STATUS } = require('../config/constants');
const auditService = require('./auditService');
const bookingService = require('./bookingService');

/**
 * Record vehicle pickup (Start Rental)
 * Admin only
 */
const recordPickup = async (bookingId, adminId, { pickupDatetime, pickupOdometer, fuelLevel, notes }) => {
  const booking = await bookingService.getBookingById(bookingId);

  // Business rules: Booking must be in PENDING or CONFIRMED state
  if (booking.booking_status !== BOOKING_STATUS.CONFIRMED && booking.booking_status !== BOOKING_STATUS.PENDING) {
    const error = new Error(`Cannot start rental for a booking with status "${booking.booking_status}". Only CONFIRMED bookings can be picked up.`);
    error.statusCode = 400;
    throw error;
  }

  const pickupTime = pickupDatetime || (db.getDriver() === 'mysql' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString());
  const odometer = Number(pickupOdometer) || 0;
  const fuel = fuelLevel || '100%';

  // Update booking status to ACTIVE
  await db.query('UPDATE bookings SET booking_status = ? WHERE id = ?', [BOOKING_STATUS.ACTIVE, booking.id]);

  // Update vehicle status to RENTED
  await db.query('UPDATE vehicles SET status = ? WHERE id = ?', [VEHICLE_STATUS.RENTED, booking.vehicle_id]);

  // Upsert into rental_records
  const existing = await db.query('SELECT id FROM rental_records WHERE booking_id = ?', [booking.id]);
  if (existing.length > 0) {
    await db.query(
      `UPDATE rental_records SET 
        pickup_datetime = ?, pickup_odometer = ?, fuel_level_pickup = ?, notes = ?
       WHERE booking_id = ?`,
      [pickupTime, odometer, fuel, notes || '', booking.id]
    );
  } else {
    await db.query(
      `INSERT INTO rental_records (
        booking_id, pickup_datetime, pickup_odometer, fuel_level_pickup, notes
      ) VALUES (?, ?, ?, ?, ?)`,
      [booking.id, pickupTime, odometer, fuel, notes || '']
    );
  }

  await auditService.logAction({
    userId: adminId,
    action: 'RENTAL_PICKUP',
    entityType: 'RENTAL',
    entityId: booking.booking_reference,
    description: `Rental started for ${booking.booking_reference}. Odometer: ${odometer} km, Fuel: ${fuel}. Vehicle marked RENTED.`
  });

  return bookingService.getBookingById(booking.id);
};

/**
 * Record vehicle return (Complete Rental)
 * Admin only
 */
const recordReturn = async (bookingId, adminId, { returnDatetime, returnOdometer, fuelLevel, additionalCharges, damageCharges, notes }) => {
  const booking = await bookingService.getBookingById(bookingId);

  if (booking.booking_status !== BOOKING_STATUS.ACTIVE && !booking.is_overdue) {
    const error = new Error(`Cannot complete return for a booking with status "${booking.booking_status}". Only ACTIVE rentals can be returned.`);
    error.statusCode = 400;
    throw error;
  }

  const returnTime = returnDatetime || (db.getDriver() === 'mysql' ? new Date().toISOString().slice(0, 19).replace('T', ' ') : new Date().toISOString());
  const odometer = Number(returnOdometer) || 0;
  const fuel = fuelLevel || '100%';
  const addCharges = Number(additionalCharges) || 0;
  const dmgCharges = Number(damageCharges) || 0;

  // Update booking status to COMPLETED
  await db.query('UPDATE bookings SET booking_status = ? WHERE id = ?', [BOOKING_STATUS.COMPLETED, booking.id]);

  // Update vehicle status back to AVAILABLE
  await db.query('UPDATE vehicles SET status = ? WHERE id = ?', [VEHICLE_STATUS.AVAILABLE, booking.vehicle_id]);

  // Update rental record
  const existing = await db.query('SELECT id FROM rental_records WHERE booking_id = ?', [booking.id]);
  if (existing.length > 0) {
    await db.query(
      `UPDATE rental_records SET 
        return_datetime = ?, return_odometer = ?, fuel_level_return = ?,
        additional_charges = ?, damage_charges = ?, notes = ?
       WHERE booking_id = ?`,
      [returnTime, odometer, fuel, addCharges, dmgCharges, notes || '', booking.id]
    );
  } else {
    await db.query(
      `INSERT INTO rental_records (
        booking_id, return_datetime, return_odometer, fuel_level_return,
        additional_charges, damage_charges, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [booking.id, returnTime, odometer, fuel, addCharges, dmgCharges, notes || '']
    );
  }

  await auditService.logAction({
    userId: adminId,
    action: 'RENTAL_RETURN',
    entityType: 'RENTAL',
    entityId: booking.booking_reference,
    description: `Rental completed for ${booking.booking_reference}. Return Odometer: ${odometer} km. Vehicle set to AVAILABLE.`
  });

  return bookingService.getBookingById(booking.id);
};

/**
 * Get rental record for a booking
 */
const getRentalRecord = async (bookingId) => {
  const rows = await db.query('SELECT * FROM rental_records WHERE booking_id = ?', [bookingId]);
  return rows.length > 0 ? rows[0] : null;
};

module.exports = {
  recordPickup,
  recordReturn,
  getRentalRecord
};
