const orderService = require('../services/orderService');

class OrderController {
  async create(req, res, next) {
    try {
      const result = await orderService.createOrder(req.user.user_id, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user.user_id);
      res.json(order);
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const orders = await orderService.getCustomerOrders(req.user.user_id, limit);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
