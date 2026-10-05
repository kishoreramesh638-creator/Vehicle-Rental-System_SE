const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { ROLES } = require('../config/constants');

router.get('/', authenticate, authorize(ROLES.ADMIN), auditController.getAuditLogs);

module.exports = router;
