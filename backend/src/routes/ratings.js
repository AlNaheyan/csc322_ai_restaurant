const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { authenticate, authorize } = require('../middleware/auth');

// Submit rating for an order
router.post('/orders/:orderId/ratings', authenticate, authorize(['customer']), ratingController.submitRating);

// Get ratings for an employee
router.get('/employees/:employeeId/ratings', authenticate, ratingController.getEmployeeRatings);

// Get ratings for an order
router.get('/orders/:orderId/ratings', authenticate, ratingController.getOrderRatings);

module.exports = router;
