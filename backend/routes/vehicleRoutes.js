const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const { authenticate, authorize, optionalAuth } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

// Public / optional auth for browsing
router.get('/', optionalAuth, vehicleController.getVehicles);
router.get('/:id', optionalAuth, vehicleController.getVehicleById);
router.get('/:id/availability', vehicleController.checkAvailability);

// Admin-only management
router.post('/', authenticate, authorize(ROLES.ADMIN), vehicleController.createVehicle);
router.put('/:id', authenticate, authorize(ROLES.ADMIN), vehicleController.updateVehicle);
router.patch('/:id/status', authenticate, authorize(ROLES.ADMIN), vehicleController.updateVehicleStatus);
router.delete('/:id', authenticate, authorize(ROLES.ADMIN), vehicleController.deleteVehicle);

module.exports = router;
