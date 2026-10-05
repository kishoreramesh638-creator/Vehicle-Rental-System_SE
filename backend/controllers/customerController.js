const customerService = require('../services/customerService');
const { sendSuccess } = require('../utils/responseHandler');

const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await customerService.getAllCustomers(req.query.search);
    return sendSuccess(res, 'Customers retrieved successfully', { customers });
  } catch (err) {
    next(err);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    return sendSuccess(res, 'Customer details retrieved', { customer });
  } catch (err) {
    next(err);
  }
};

const updateCustomerStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const customer = await customerService.updateCustomerStatus(req.params.id, status, req.user.id);
    return sendSuccess(res, `Customer status updated to ${status}`, { customer });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  updateCustomerStatus
};
