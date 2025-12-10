const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { authenticate, authorize } = require('../middleware/auth');

// File a complaint or compliment
router.post('/', authenticate, complaintController.fileComplaint);

// Get pending complaints (manager only)
router.get('/pending', authenticate, authorize(['manager']), complaintController.getPendingComplaints);

// Review a complaint (manager only)
router.put('/:complaintId/review', authenticate, authorize(['manager']), complaintController.reviewComplaint);

// Dispute a complaint
router.put('/:complaintId/dispute', authenticate, complaintController.disputeComplaint);

// Get my complaints (filed or received)
router.get('/my', authenticate, complaintController.getMyComplaints);

// Get my warnings
router.get('/warnings', authenticate, complaintController.getMyWarnings);

module.exports = router;
