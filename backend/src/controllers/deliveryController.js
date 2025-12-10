const deliveryService = require('../services/deliveryService');
const { Employee } = require('../models');

const getAvailableOrders = async (req, res) => {
  try {
    const orders = await deliveryService.getAvailableOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyDeliveries = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.user_id } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    const orders = await deliveryService.getMyDeliveries(employee.employee_id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const acceptDelivery = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.user_id } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    const result = await deliveryService.acceptDelivery(employee.employee_id, req.params.orderId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.user_id } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    const { status } = req.body;
    const result = await deliveryService.updateOrderStatus(
      employee.employee_id,
      req.params.orderId,
      status
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getDeliveryStats = async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { user_id: req.user.user_id } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    const stats = await deliveryService.getDeliveryStats(employee.employee_id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAvailableOrders,
  getMyDeliveries,
  acceptDelivery,
  updateOrderStatus,
  getDeliveryStats
};
