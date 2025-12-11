const { Order, OrderItem, MenuItem, Customer, User, Employee } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

class DeliveryService {
  async getAvailableOrders() {
    const orders = await Order.findAll({
      where: {
        status: 'ready',
        assigned_delivery_person: null
      },
      include: [
        {
          model: Customer,
          include: [{ model: User, attributes: ['first_name', 'last_name', 'phone'] }]
        },
        {
          model: OrderItem,
          include: [{ model: MenuItem }]
        }
      ],
      order: [['created_at', 'ASC']],
      limit: 20
    });

    return orders;
  }

  async getMyDeliveries(employeeId) {
    const orders = await Order.findAll({
      where: {
        assigned_delivery_person: employeeId,
        status: {
          [Op.in]: ['ready', 'out_for_delivery']
        }
      },
      include: [
        {
          model: Customer,
          include: [{ model: User, attributes: ['first_name', 'last_name', 'phone'] }]
        },
        {
          model: OrderItem,
          include: [{ model: MenuItem }]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    return orders;
  }

  async acceptDelivery(employeeId, orderId) {
    const order = await Order.findByPk(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'ready') {
      throw new Error('Order is not ready for delivery');
    }

    if (order.assigned_delivery_person) {
      throw new Error('Order has already been assigned');
    }

    await order.update({
      assigned_delivery_person: employeeId,
      status: 'ready'
    });

    return { message: 'Delivery accepted', order };
  }

  async updateOrderStatus(employeeId, orderId, status) {
    const order = await Order.findByPk(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.assigned_delivery_person !== employeeId) {
      throw new Error('You are not assigned to this delivery');
    }

    const validTransitions = {
      'ready': ['out_for_delivery'],
      'out_for_delivery': ['delivered']
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw new Error(`Cannot change status from ${order.status} to ${status}`);
    }

    const updateData = { status };
    if (status === 'delivered') {
      updateData.actual_delivery_time = new Date();
    }

    if (status !== 'delivered') {
      await order.update(updateData);
      return { message: 'Order status updated', order };
    }

    const customer = await Customer.findByPk(order.customer_id);
    if (!customer) {
      throw new Error('Customer not found for this order');
    }
    const cashbackRate = customer?.is_vip ? 0.10 : 0.05;
    const cashbackAmount = parseFloat((parseFloat(order.total) * cashbackRate).toFixed(2));

    await sequelize.transaction(async (transaction) => {
      await order.update(updateData, { transaction });

      if (!order.cashback_awarded && cashbackAmount > 0) {
        const currentCashback = parseFloat(customer.cashback_balance);
        const updatedCashback = currentCashback + cashbackAmount;

        await customer.update(
          { cashback_balance: updatedCashback },
          { transaction }
        );

        await order.update(
          {
            cashback_awarded: true,
            cashback_amount: cashbackAmount
          },
          { transaction }
        );
      }
    });

    await order.reload();

    return { message: 'Order status updated', order };
  }

  async getDeliveryStats(employeeId) {
    const totalDeliveries = await Order.count({
      where: {
        assigned_delivery_person: employeeId,
        status: 'delivered'
      }
    });

    const activeDeliveries = await Order.count({
      where: {
        assigned_delivery_person: employeeId,
        status: {
          [Op.in]: ['ready', 'out_for_delivery']
        }
      }
    });

    const employee = await Employee.findByPk(employeeId);

    return {
      total_deliveries: totalDeliveries,
      active_deliveries: activeDeliveries,
      average_rating: employee?.average_rating || 0,
      total_ratings: employee?.total_ratings || 0
    };
  }
}

module.exports = new DeliveryService();
