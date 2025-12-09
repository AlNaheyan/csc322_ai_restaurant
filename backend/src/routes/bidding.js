const express = require('express');
const router = express.Router();
const biddingController = require('../controllers/biddingController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.use(authenticate);

router.post('/orders/:orderId/bid', requireRole('delivery'), biddingController.submitBid);
router.get('/bids/my-bids', requireRole('delivery'), biddingController.getMyBids);
router.delete('/bids/:bidId', requireRole('delivery'), biddingController.withdrawBid);

router.get('/orders/:orderId/bids', requireRole('manager'), biddingController.getBidsForOrder);
router.post('/bids/:bidId/accept', requireRole('manager'), biddingController.acceptBid);

module.exports = router;
