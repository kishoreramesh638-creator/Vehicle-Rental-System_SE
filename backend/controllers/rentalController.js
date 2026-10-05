const rentalService = require('../services/rentalService');
const { sendSuccess } = require('../utils/responseHandler');

const recordPickup = async (req, res, next) => {
  try {
    const booking = await rentalService.recordPickup(req.params.bookingId, req.user.id, req.body);
    return sendSuccess(res, 'Vehicle pickup confirmed. Rental is now ACTIVE.', { booking });
  } catch (err) {
    next(err);
  }
};

const recordReturn = async (req, res, next) => {
  try {
    const booking = await rentalService.recordReturn(req.params.bookingId, req.user.id, req.body);
    return sendSuccess(res, 'Vehicle return confirmed. Rental is now COMPLETED.', { booking });
  } catch (err) {
    next(err);
  }
};

const getRentalRecord = async (req, res, next) => {
  try {
    const record = await rentalService.getRentalRecord(req.params.bookingId);
    return sendSuccess(res, 'Rental record retrieved', { record });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  recordPickup,
  recordReturn,
  getRentalRecord
};
