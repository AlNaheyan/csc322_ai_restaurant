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
}

module.exports = new CustomerController();
