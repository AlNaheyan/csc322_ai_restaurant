const { Employee, User } = require('../models');
const { Op } = require('sequelize');

class EmployeeService {
  async getTopChefs(limit = 3) {
    const chefs = await Employee.findAll({
      where: {
        employee_type: 'chef',
        is_available: true
      },
      include: [{
        model: User,
        attributes: ['first_name', 'last_name', 'email']
      }],
      order: [
        ['average_rating', 'DESC'],
        ['total_ratings', 'DESC']
      ],
      limit: limit
    });

    return chefs;
  }

  async getTopDeliveryPersons(limit = 3) {
    const deliveryPersons = await Employee.findAll({
      where: {
        employee_type: 'delivery',
        is_available: true
      },
      include: [{
        model: User,
        attributes: ['first_name', 'last_name', 'email']
      }],
      order: [
        ['average_rating', 'DESC'],
        ['total_ratings', 'DESC']
      ],
      limit: limit
    });

    return deliveryPersons;
  }
}

module.exports = new EmployeeService();
