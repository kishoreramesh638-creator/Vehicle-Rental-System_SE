/**
 * Date calculation and overlap utility functions
 */

/**
 * Calculates inclusive or day-difference between two dates
 * e.g., 2026-10-10 to 2026-10-12 = 2 days
 */
const calculateRentalDays = (pickupDateStr, returnDateStr) => {
  const pickup = new Date(pickupDateStr);
  const ret = new Date(returnDateStr);
  
  if (isNaN(pickup.getTime()) || isNaN(ret.getTime())) {
    throw new Error('Invalid date format');
  }

  // Set to midnight UTC for clean day calculation
  const diffTime = ret.getTime() - pickup.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(1, diffDays);
};

/**
 * Validates date order and minimum date (cannot be before today)
 */
const validateBookingDates = (pickupDateStr, returnDateStr) => {
  const pickup = new Date(pickupDateStr);
  const ret = new Date(returnDateStr);
  const now = new Date();
  
  // Reset time part of today
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const pickupDay = new Date(pickup.getFullYear(), pickup.getMonth(), pickup.getDate());

  if (isNaN(pickup.getTime()) || isNaN(ret.getTime())) {
    return { valid: false, message: 'Pickup and return dates must be valid dates' };
  }

  if (pickupDay < today) {
    return { valid: false, message: 'Pickup date cannot be in the past' };
  }

  if (ret <= pickup) {
    return { valid: false, message: 'Return date must be strictly after pickup date' };
  }

  return { valid: true };
};

/**
 * Checks if an active booking is overdue
 */
const isBookingOverdue = (booking) => {
  if (booking.booking_status !== 'ACTIVE') {
    return false;
  }
  const returnDate = new Date(booking.return_date);
  returnDate.setHours(23, 59, 59, 999); // Until end of the return day
  return new Date() > returnDate;
};

module.exports = {
  calculateRentalDays,
  validateBookingDates,
  isBookingOverdue
};
