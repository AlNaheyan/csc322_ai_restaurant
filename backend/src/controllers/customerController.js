const customerService = require('../services/customerService');

class CustomerController {
  async addDeposit(req, res, next) {
    try {
      const { amount } = req.body;
      const result = await customerService.addDeposit(req.user.user_id, amount);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTransactionHistory(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const transactions = await customerService.getTransactionHistory(req.user.user_id, limit);
      res.json(transactions);
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const customer = await customerService.getCustomerByUserId(req.user.user_id);
      res.json(customer);
    } catch (error) {
      next(error);
    }
  }

  async requestAccountClosure(req, res, next) {
    try {
      const { reason } = req.body;
      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({ error: 'Please provide a reason for account closure' });
      }
      const result = await customerService.requestAccountClosure(req.user.user_id, reason);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CustomerController();
