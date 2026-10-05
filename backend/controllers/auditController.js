const auditService = require('../services/auditService');
const { sendSuccess } = require('../utils/responseHandler');

const getAuditLogs = async (req, res, next) => {
  try {
    const { limit, offset, entityType, action } = req.query;
    const logs = await auditService.getAuditLogs({ limit, offset, entityType, action });
    return sendSuccess(res, 'Audit logs retrieved', { logs });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAuditLogs
};
