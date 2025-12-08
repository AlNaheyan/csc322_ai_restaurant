const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.use(authenticate);
router.use(requireRole('delivery'));

router.get('/available-orders', deliveryController.getAvailableOrders);
router.get('/my-deliveries', deliveryController.getMyDeliveries);
router.post('/accept/:orderId', deliveryController.acceptDelivery);
router.patch('/order/:orderId/status', deliveryController.updateOrderStatus);
router.get('/stats', deliveryController.getDeliveryStats);

module.exports = router;
