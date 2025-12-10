const { Complaint, Warning, User, Customer, Employee } = require('../models');
const { Op } = require('sequelize');

class ComplaintService {
  async fileComplaint(filerId, complaintData) {
    const { subject_id, subject_type, complaint_type, category, description, evidence_url } = complaintData;

    // Get filer to check VIP status
    const filer = await User.findByPk(filerId, {
      include: [{ model: Customer }]
    });

    const isVip = filer.Customer && filer.Customer.is_vip;

    // Create complaint
    const complaint = await Complaint.create({
      filer_id: filerId,
      subject_id,
      subject_type,
      complaint_type,
      category,
      description,
      evidence_url,
      is_vip_complaint: isVip,
      status: 'pending'
    });

    return complaint;
  }

  async getPendingComplaints() {
    const complaints = await Complaint.findAll({
      where: {
        status: { [Op.in]: ['pending', 'under_review'] }
      },
      include: [
        { model: User, as: 'Filer', attributes: ['user_id', 'email', 'first_name', 'last_name'] },
        { model: User, as: 'Subject', attributes: ['user_id', 'email', 'first_name', 'last_name'] }
      ],
      order: [
        ['is_vip_complaint', 'DESC'], // VIP complaints first
        ['created_at', 'ASC']
      ]
    });

    return complaints;
  }

  async reviewComplaint(complaintId, managerId, decision, notes) {
    const complaint = await Complaint.findByPk(complaintId);

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    if (complaint.status === 'resolved') {
      throw new Error('Complaint already resolved');
    }

    // Update complaint
    await complaint.update({
      status: 'resolved',
      manager_decision: decision,
      manager_notes: notes,
      resolved_by: managerId,
      resolved_at: new Date()
    });

    // If complaint is upheld, issue warning
    if (decision === 'upheld' && complaint.complaint_type === 'complaint') {
      await this.issueWarning(complaint.subject_id, 'complaint_upheld', complaint.description);
    }

    // Check for compliment-complaint cancellation
    if (complaint.complaint_type === 'complaint' || complaint.complaint_type === 'compliment') {
      await this.checkCancellation(complaint.subject_id);
    }

    return complaint;
  }

  async issueWarning(userId, warningType, reason) {
    const warning = await Warning.create({
      user_id: userId,
      warning_type: warningType,
      source: 'complaint',
      reason,
      is_active: true
    });

    // Check if user has 3+ active warnings
    const activeWarnings = await Warning.count({
      where: { user_id: userId, is_active: true }
    });

    if (activeWarnings >= 3) {
      // Terminate user account
      await User.update(
        { status: 'terminated' },
        { where: { user_id: userId } }
      );
    }

    return warning;
  }

  async checkCancellation(userId) {
    // Get recent resolved complaints and compliments
    const complaints = await Complaint.findAll({
      where: {
        subject_id: userId,
        status: 'resolved',
        manager_decision: 'upheld'
      },
      order: [['resolved_at', 'DESC']],
      limit: 10
    });

    const recentComplaints = complaints.filter(c => c.complaint_type === 'complaint');
    const recentCompliments = complaints.filter(c => c.complaint_type === 'compliment');

    // For each recent complaint, check if there's a matching compliment
    for (const complaint of recentComplaints) {
      if (recentCompliments.length > 0) {
        const compliment = recentCompliments[0];

        // Deactivate one warning
        const warning = await Warning.findOne({
          where: { user_id: userId, is_active: true },
          order: [['issued_at', 'DESC']]
        });

        if (warning) {
          await warning.update({ is_active: false });
        }

        // Remove compliment from pool
        recentCompliments.shift();
      }
    }
  }

  async disputeComplaint(complaintId, disputeNotes) {
    const complaint = await Complaint.findByPk(complaintId);

    if (!complaint) {
      throw new Error('Complaint not found');
    }

    if (complaint.status !== 'resolved') {
      throw new Error('Can only dispute resolved complaints');
    }

    await complaint.update({
      is_disputed: true,
      dispute_notes: disputeNotes,
      status: 'under_review'
    });

    return complaint;
  }

  async getComplaintsForUser(userId, role) {
    let where = {};

    if (role === 'filer') {
      where.filer_id = userId;
    } else if (role === 'subject') {
      where.subject_id = userId;
    }

    const complaints = await Complaint.findAll({
      where,
      include: [
        { model: User, as: 'Filer', attributes: ['user_id', 'email', 'first_name', 'last_name'] },
        { model: User, as: 'Subject', attributes: ['user_id', 'email', 'first_name', 'last_name'] },
        { model: User, as: 'Resolver', attributes: ['user_id', 'email', 'first_name', 'last_name'] }
      ],
      order: [['created_at', 'DESC']]
    });

    return complaints;
  }

  async getWarningsForUser(userId) {
    const warnings = await Warning.findAll({
      where: { user_id: userId },
      order: [['issued_at', 'DESC']]
    });

    return warnings;
  }
}

module.exports = new ComplaintService();
