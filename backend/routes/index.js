const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const vehicleRoutes = require('./vehicleRoutes');
const bookingRoutes = require('./bookingRoutes');
const rentalRoutes = require('./rentalRoutes');
const paymentRoutes = require('./paymentRoutes');
const customerRoutes = require('./customerRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const auditRoutes = require('./auditRoutes');

// Mount sub-routers
router.use('/auth', authRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/bookings', bookingRoutes);
router.use('/rentals', rentalRoutes);
router.use('/payments', paymentRoutes);
router.use('/customers', customerRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/audit-logs', auditRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Vehicle Rental System API is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
