const { User, Customer, Order, Complaint } = require('../models');
const { Op } = require('sequelize');

class VipService {
  async checkAndUpgradeVipStatus(customerId) {
    const customer = await Customer.findByPk(customerId, {
      include: [{ model: User }]
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const totalSpent = parseFloat(customer.total_spent || 0);
    const orderCount = parseInt(customer.order_count || 0);

    const activeComplaints = await Complaint.count({
      where: {
        subject_id: customer.user_id,
        status: { [Op.in]: ['pending', 'under_review'] }
      }
    });

    const isEligible = (totalSpent > 100 || orderCount >= 3) && activeComplaints === 0;

    if (isEligible && customer.User.role !== 'vip') {
      await customer.User.update({ role: 'vip' });
      await customer.update({ is_vip: true });
      return { upgraded: true, reason: 'eligibility_met' };
    }

    if (!isEligible && customer.User.role === 'vip') {
      await customer.User.update({ role: 'customer' });
      await customer.update({ is_vip: false });
      return { downgraded: true, reason: 'eligibility_lost' };
    }

    return { changed: false };
  }

  async checkAllCustomersVipStatus() {
    const customers = await Customer.findAll({
      include: [{ model: User }]
    });

    const results = {
      upgraded: [],
      downgraded: [],
      checked: customers.length
    };

    for (const customer of customers) {
      try {
        const result = await this.checkAndUpgradeVipStatus(customer.customer_id);
        if (result.upgraded) {
          results.upgraded.push(customer.customer_id);
        } else if (result.downgraded) {
          results.downgraded.push(customer.customer_id);
        }
      } catch (err) {
        console.error(`Error checking VIP status for customer ${customer.customer_id}:`, err);
      }
    }

    return results;
  }

  async getVipCustomers() {
    const vipCustomers = await Customer.findAll({
      where: { is_vip: true },
      include: [{ model: User, attributes: ['user_id', 'email', 'first_name', 'last_name'] }],
      order: [['total_spent', 'DESC']]
    });

    return vipCustomers;
  }
}

module.exports = new VipService();
