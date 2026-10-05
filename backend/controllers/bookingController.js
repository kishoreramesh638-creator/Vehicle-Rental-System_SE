const bookingService = require('../services/bookingService');
const { sendSuccess } = require('../utils/responseHandler');

const createBooking = async (req, res, next) => {
  try {
    const { vehicleId, pickupDate, returnDate, pickupLocation, returnLocation } = req.body;
    const booking = await bookingService.createBooking({
      userId: req.user.id,
      vehicleId,
      pickupDate,
      returnDate,
      pickupLocation,
      returnLocation
    });
    return sendSuccess(res, 'Booking created successfully. Reference: ' + booking.booking_reference, { booking }, 201);
  } catch (err) {
    next(err);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await bookingService.getCustomerBookings(req.user.id, req.query.status);
    return sendSuccess(res, 'My bookings retrieved', { bookings });
  } catch (err) {
    next(err);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user);
    return sendSuccess(res, 'Booking details retrieved', { booking });
  } catch (err) {
    next(err);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user, req.body.reason);
    return sendSuccess(res, 'Booking cancelled successfully', { booking });
  } catch (err) {
    next(err);
  }
};

const getAllBookingsAdmin = async (req, res, next) => {
  try {
    const bookings = await bookingService.getAllBookingsAdmin(req.query);
    return sendSuccess(res, 'All bookings retrieved', { bookings });
  } catch (err) {
    next(err);
  }
};

const updateBookingStatusAdmin = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const booking = await bookingService.updateBookingStatusAdmin(req.params.id, status, req.user.id, reason);
    return sendSuccess(res, `Booking status updated to ${status}`, { booking });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getAllBookingsAdmin,
  updateBookingStatusAdmin
};
