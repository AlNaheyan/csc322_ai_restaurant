const express = require('express');
const router = express.Router();
const managerController = require('../controllers/managerController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize(['manager']));

router.get('/registrations/pending', managerController.getPendingRegistrations);
router.put('/registrations/:customerId/approve', managerController.approveRegistration);
router.put('/registrations/:customerId/reject', managerController.rejectRegistration);

router.get('/analytics/overview', managerController.getOverviewStats);
router.get('/analytics/revenue', managerController.getRevenueAnalytics);
router.get('/analytics/orders', managerController.getOrderAnalytics);
router.get('/analytics/customers', managerController.getCustomerAnalytics);
router.get('/analytics/employees', managerController.getEmployeeAnalytics);
router.get('/analytics/complaints', managerController.getComplaintAnalytics);
router.get('/analytics/menu', managerController.getMenuAnalytics);
router.get('/analytics/financial', managerController.getFinancialSummary);

module.exports = router;
