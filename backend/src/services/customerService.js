const { Customer, Transaction, User } = require('../models');
const { sequelize } = require('../config/database');

class CustomerService {
  async getCustomerByUserId(userId) {
    const customer = await Customer.findOne({
      where: { user_id: userId },
      include: [{ model: User }]
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer;
  }

  async addDeposit(userId, amount) {
    const minDeposit = parseFloat(process.env.MIN_DEPOSIT) || 10.00;

    if (amount < minDeposit) {
      throw new Error(`Minimum deposit is $${minDeposit}`);
    }

    const customer = await Customer.findOne({ where: { user_id: userId } });
    if (!customer) {
      throw new Error('Customer not found');
    }

    const transaction = await sequelize.transaction();

    try {
      const balanceBefore = parseFloat(customer.deposit_balance);
      const balanceAfter = balanceBefore + parseFloat(amount);

      await customer.update(
        { deposit_balance: balanceAfter },
        { transaction }
      );

      await Transaction.create({
        customer_id: customer.customer_id,
        transaction_type: 'deposit',
        amount: amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: 'Customer deposit'
      }, { transaction });

      await transaction.commit();

      return {
        message: 'Deposit successful',
        new_balance: balanceAfter
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getTransactionHistory(userId, limit = 50) {
    const customer = await Customer.findOne({ where: { user_id: userId } });
    if (!customer) {
      throw new Error('Customer not found');
    }

    const transactions = await Transaction.findAll({
      where: { customer_id: customer.customer_id },
      order: [['created_at', 'DESC']],
      limit
    });

    return transactions;
  }

  async checkVipEligibility(customerId) {
    const customer = await Customer.findByPk(customerId, {
      include: [{ model: User }]
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    if (customer.is_vip) {
      return { is_eligible: false, reason: 'Already VIP' };
    }

    const spendingThreshold = parseFloat(process.env.VIP_SPENDING_THRESHOLD) || 100.00;
    const orderThreshold = parseInt(process.env.VIP_ORDER_THRESHOLD) || 3;

    const meetsSpending = parseFloat(customer.total_spent) >= spendingThreshold;
    const meetsOrders = customer.order_count >= orderThreshold && customer.User.warning_count === 0;

    if (meetsSpending || meetsOrders) {
      await customer.update({
        is_vip: true,
        vip_upgraded_at: new Date()
      });

      return {
        is_eligible: true,
        upgraded: true,
        reason: meetsSpending ? 'spending_threshold' : 'order_threshold'
      };
    }

    return {
      is_eligible: false,
      reason: 'Does not meet criteria',
      progress: {
        spending: parseFloat(customer.total_spent),
        spending_needed: spendingThreshold,
        orders: customer.order_count,
        orders_needed: orderThreshold
      }
    };
  }

  async requestAccountClosure(userId, reason) {
    const customer = await Customer.findOne({
      where: { user_id: userId },
      include: [{ model: User }]
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    if (parseFloat(customer.deposit_balance) > 0) {
      throw new Error('Cannot close account with remaining balance. Please withdraw or use your balance first.');
    }

    const transaction = await sequelize.transaction();

    try {
      await customer.User.update({
        is_active: false,
        blacklist_reason: `Account closure requested: ${reason}`
      }, { transaction });

      await transaction.commit();

      return {
        message: 'Account closure request submitted successfully. Your account has been deactivated.'
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new CustomerService();
