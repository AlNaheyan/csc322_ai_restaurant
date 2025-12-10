const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/evaluate/:employeeId', authenticate, authorize(['manager']), performanceController.evaluateEmployee);
router.post('/evaluate-all', authenticate, authorize(['manager']), performanceController.evaluateAllEmployees);
router.get('/history/:employeeId', authenticate, authorize(['manager']), performanceController.getEmployeePerformanceHistory);
router.get('/history', authenticate, authorize(['manager']), performanceController.getAllPerformanceHistory);
router.post('/blacklist/:userId', authenticate, authorize(['manager']), performanceController.blacklistUser);
router.get('/blacklist', authenticate, authorize(['manager']), performanceController.getBlacklist);
router.delete('/blacklist/:blacklistId', authenticate, authorize(['manager']), performanceController.removeFromBlacklist);

module.exports = router;
