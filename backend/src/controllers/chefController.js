const chefService = require('../services/chefService');
const { Employee } = require('../models');

class ChefController {
  async getProfile(req, res) {
    try {
      const profile = await chefService.getChefProfile(req.user.user_id);
      res.json(profile);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getDashboard(req, res) {
    try {
      const employee = await Employee.findOne({
        where: { user_id: req.user.user_id }
      });

      if (!employee) {
        return res.status(404).json({ error: 'Chef profile not found' });
      }

      const stats = await chefService.getDashboardStats(employee.employee_id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMyMenuItems(req, res) {
    try {
      const employee = await Employee.findOne({
        where: { user_id: req.user.user_id }
      });

      if (!employee) {
        return res.status(404).json({ error: 'Chef profile not found' });
      }

      const items = await chefService.getMyMenuItems(employee.employee_id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createMenuItem(req, res) {
    try {
      const employee = await Employee.findOne({
        where: { user_id: req.user.user_id }
      });

      if (!employee) {
        return res.status(404).json({ error: 'Chef profile not found' });
      }

      const menuItem = await chefService.createMenuItem(employee.employee_id, req.body);
      res.status(201).json(menuItem);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateMenuItem(req, res) {
    try {
      const employee = await Employee.findOne({
        where: { user_id: req.user.user_id }
      });

      if (!employee) {
        return res.status(404).json({ error: 'Chef profile not found' });
      }

      const menuItem = await chefService.updateMyMenuItem(
        employee.employee_id,
        req.params.id,
        req.body
      );
      res.json(menuItem);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteMenuItem(req, res) {
    try {
      const employee = await Employee.findOne({
        where: { user_id: req.user.user_id }
      });

      if (!employee) {
        return res.status(404).json({ error: 'Chef profile not found' });
      }

      const result = await chefService.deleteMyMenuItem(employee.employee_id, req.params.id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getMyOrders(req, res) {
    try {
      const employee = await Employee.findOne({
        where: { user_id: req.user.user_id }
      });

      if (!employee) {
        return res.status(404).json({ error: 'Chef profile not found' });
      }

      const orders = await chefService.getMyOrders(employee.employee_id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async markOrderReady(req, res) {
    try {
      const employee = await Employee.findOne({
        where: { user_id: req.user.user_id }
      });

      if (!employee) {
        return res.status(404).json({ error: 'Chef profile not found' });
      }

      const result = await chefService.markOrderReady(req.params.orderId, employee.employee_id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new ChefController();
