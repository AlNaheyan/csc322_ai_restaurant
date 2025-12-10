const complaintService = require('../services/complaintService');

class ComplaintController {
  async fileComplaint(req, res) {
    try {
      const filerId = req.user.userId;
      const complaintData = req.body;

      const complaint = await complaintService.fileComplaint(filerId, complaintData);

      res.status(201).json({
        success: true,
        message: 'Complaint/compliment filed successfully',
        data: complaint
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getPendingComplaints(req, res) {
    try {
      const complaints = await complaintService.getPendingComplaints();

      res.json({
        success: true,
        data: complaints
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async reviewComplaint(req, res) {
    try {
      const managerId = req.user.userId;
      const { complaintId } = req.params;
      const { decision, notes } = req.body;

      const complaint = await complaintService.reviewComplaint(
        complaintId,
        managerId,
        decision,
        notes
      );

      res.json({
        success: true,
        message: 'Complaint reviewed successfully',
        data: complaint
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async disputeComplaint(req, res) {
    try {
      const { complaintId } = req.params;
      const { dispute_notes } = req.body;

      const complaint = await complaintService.disputeComplaint(
        complaintId,
        dispute_notes
      );

      res.json({
        success: true,
        message: 'Complaint disputed successfully',
        data: complaint
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getMyComplaints(req, res) {
    try {
      const userId = req.user.userId;
      const { role } = req.query; // 'filer' or 'subject'

      const complaints = await complaintService.getComplaintsForUser(userId, role);

      res.json({
        success: true,
        data: complaints
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getMyWarnings(req, res) {
    try {
      const userId = req.user.userId;

      const warnings = await complaintService.getWarningsForUser(userId);

      res.json({
        success: true,
        data: warnings
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ComplaintController();
