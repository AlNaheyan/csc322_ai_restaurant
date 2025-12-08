const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/profile', customerController.getProfile);
router.post('/deposit', customerController.addDeposit);
router.get('/transactions', customerController.getTransactionHistory);

module.exports = router;
