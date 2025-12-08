const employeeService = require('../services/employeeService');

class EmployeeController {
  async getTopChefs(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 3;
      const chefs = await employeeService.getTopChefs(limit);
      res.json(chefs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getTopDeliveryPersons(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 3;
      const deliveryPersons = await employeeService.getTopDeliveryPersons(limit);
      res.json(deliveryPersons);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new EmployeeController();
