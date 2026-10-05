const vehicleService = require('../services/vehicleService');
const { sendSuccess } = require('../utils/responseHandler');
const { ROLES } = require('../config/constants');

const getVehicles = async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.role === ROLES.ADMIN;
    const vehicles = await vehicleService.getVehicles(req.query, isAdmin);
    return sendSuccess(res, 'Vehicles retrieved successfully', { vehicles });
  } catch (err) {
    next(err);
  }
};

const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    return sendSuccess(res, 'Vehicle details retrieved', { vehicle });
  } catch (err) {
    next(err);
  }
};

const checkAvailability = async (req, res, next) => {
  try {
    const { pickupDate, returnDate } = req.query;
    if (!pickupDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: 'Both pickupDate and returnDate are required query parameters'
      });
    }
    const result = await vehicleService.checkAvailability(req.params.id, pickupDate, returnDate);
    return sendSuccess(res, result.reason, result);
  } catch (err) {
    next(err);
  }
};

const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.createVehicle(req.body, req.user.id);
    return sendSuccess(res, 'Vehicle created successfully', { vehicle }, 201);
  } catch (err) {
    next(err);
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body, req.user.id);
    return sendSuccess(res, 'Vehicle updated successfully', { vehicle });
  } catch (err) {
    next(err);
  }
};

const updateVehicleStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const vehicle = await vehicleService.updateVehicleStatus(req.params.id, status, req.user.id);
    return sendSuccess(res, 'Vehicle status updated successfully', { vehicle });
  } catch (err) {
    next(err);
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const result = await vehicleService.deleteVehicle(req.params.id, req.user.id);
    return sendSuccess(res, result.message);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVehicles,
  getVehicleById,
  checkAvailability,
  createVehicle,
  updateVehicle,
  updateVehicleStatus,
  deleteVehicle
};
