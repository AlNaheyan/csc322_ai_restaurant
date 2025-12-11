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

router.post('/memos', managerController.createMemo);
router.get('/memos', managerController.getAllMemos);
router.get('/memos/:memoId', managerController.getMemoById);
router.get('/memos/:referenceType/:referenceId', managerController.getMemosByReference);
router.put('/memos/:memoId', managerController.updateMemo);
router.delete('/memos/:memoId', managerController.deleteMemo);

router.get('/discussions/reported-posts', managerController.getReportedPosts);
router.put('/discussions/posts/:postId/unreport', managerController.unreportPost);
router.delete('/discussions/posts/:postId', managerController.deleteReportedPost);

module.exports = router;
