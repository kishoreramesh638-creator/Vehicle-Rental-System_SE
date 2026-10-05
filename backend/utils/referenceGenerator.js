/**
 * Generate a unique, professional booking reference
 * Format: VR-YYYY-XXXXXX (e.g., VR-2026-849102)
 */
const generateBookingReference = () => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  return `VR-${year}-${randomSuffix}`;
};

/**
 * Generate unique transaction reference for payment
 * Format: TXN-YYYY-XXXXXX
 */
const generateTransactionReference = (prefix = 'TXN') => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${timestamp}-${random}`;
};

module.exports = {
  generateBookingReference,
  generateTransactionReference
};
