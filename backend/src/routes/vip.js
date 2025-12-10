const express = require('express');
const router = express.Router();
const vipController = require('../controllers/vipController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/check/:customerId', authenticate, authorize(['manager']), vipController.checkVipStatus);
router.post('/check-all', authenticate, authorize(['manager']), vipController.checkAllVipStatus);
router.get('/customers', authenticate, authorize(['manager']), vipController.getVipCustomers);

module.exports = router;
