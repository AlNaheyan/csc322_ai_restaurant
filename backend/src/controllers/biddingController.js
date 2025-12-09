const biddingService = require('../services/biddingService');
const { Employee } = require('../models');

const submitBid = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.userId } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    const bid = await biddingService.submitBid(
      employee.employee_id,
      req.params.orderId,
      req.body
    );

    res.status(201).json(bid);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getBidsForOrder = async (req, res) => {
  try {
    const bids = await biddingService.getBidsForOrder(req.params.orderId);
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const acceptBid = async (req, res) => {
  try {
    const { justification } = req.body;
    const result = await biddingService.acceptBid(
      req.params.bidId,
      req.user.userId,
      justification
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const withdrawBid = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.userId } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    const result = await biddingService.withdrawBid(req.params.bidId, employee.employee_id);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMyBids = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.userId } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    const { status } = req.query;
    const bids = await biddingService.getMyBids(employee.employee_id, status);
    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  submitBid,
  getBidsForOrder,
  acceptBid,
  withdrawBid,
  getMyBids
};
