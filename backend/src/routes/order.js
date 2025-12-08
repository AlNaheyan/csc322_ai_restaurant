const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/', orderController.create);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getById);

module.exports = router;
