const express = require('express');
const router = express.Router();
const biddingController = require('../controllers/biddingController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/orders/ready', authorize(['delivery']), biddingController.getReadyOrders);
router.post('/orders/:orderId/bid', authorize(['delivery']), biddingController.submitBid);
router.get('/bids/my-bids', authorize(['delivery']), biddingController.getMyBids);
router.delete('/bids/:bidId', authorize(['delivery']), biddingController.withdrawBid);

router.get('/orders/with-bids', authorize(['manager']), biddingController.getOrdersWithBids);
router.get('/orders/:orderId/bids', authorize(['manager']), biddingController.getBidsForOrder);
router.post('/bids/:bidId/accept', authorize(['manager']), biddingController.acceptBid);

module.exports = router;
