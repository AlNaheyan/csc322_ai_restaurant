const { Order, OrderItem, MenuItem, Customer, Transaction } = require('../models');
const { sequelize } = require('../config/database');
const customerService = require('./customerService');

class OrderService {
  calculateOrderTotal(items, isVip, orderCount) {
    const taxRate = parseFloat(process.env.TAX_RATE) || 0.08;
    const deliveryFee = parseFloat(process.env.BASE_DELIVERY_FEE) || 5.00;
    const vipDiscountRate = parseFloat(process.env.VIP_DISCOUNT_RATE) || 0.05;

    let subtotal = items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0);

    const discount = isVip ? subtotal * vipDiscountRate : 0;
    const tax = subtotal * taxRate;

    const isFreeDelivery = isVip && (orderCount + 1) % 3 === 0;
    const actualDeliveryFee = isFreeDelivery ? 0 : deliveryFee;

    const total = subtotal - discount + tax + actualDeliveryFee;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      delivery_fee: parseFloat(actualDeliveryFee.toFixed(2)),
      is_free_delivery: isFreeDelivery,
      total: parseFloat(total.toFixed(2))
    };
  }

  async createOrder(userId, orderData) {
    const { items, delivery_address, special_instructions } = orderData;

    if (!items || items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    const customer = await Customer.findOne({
      where: { user_id: userId }
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    const menuItems = await MenuItem.findAll({
      where: {
        item_id: items.map(i => i.item_id)
      }
    });

    if (menuItems.length !== items.length) {
      throw new Error('Some menu items not found');
    }

    for (const menuItem of menuItems) {
      if (!menuItem.is_available) {
        throw new Error(`${menuItem.name} is not available`);
      }
      if (menuItem.is_vip_only && !customer.is_vip) {
        throw new Error(`${menuItem.name} is VIP only`);
      }
    }

    const itemsWithPrices = items.map(item => {
      const menuItem = menuItems.find(m => m.item_id === item.item_id);
      return {
        ...item,
        price: menuItem.price,
        chef_id: menuItem.chef_id
      };
    });

    const orderTotal = this.calculateOrderTotal(
      itemsWithPrices,
      customer.is_vip,
      customer.order_count
    );

    if (parseFloat(customer.deposit_balance) < orderTotal.total) {
      throw new Error('Insufficient balance. Please add funds to your account.');
    }

    const transaction = await sequelize.transaction();

    try {
      const balanceBefore = parseFloat(customer.deposit_balance);
      const balanceAfter = balanceBefore - orderTotal.total;

      await customer.update({
        deposit_balance: balanceAfter,
        total_spent: parseFloat(customer.total_spent) + orderTotal.total,
        order_count: customer.order_count + 1
      }, { transaction });

      const order = await Order.create({
        customer_id: customer.customer_id,
        status: 'pending',
        subtotal: orderTotal.subtotal,
        tax: orderTotal.tax,
        delivery_fee: orderTotal.delivery_fee,
        discount: orderTotal.discount,
        total: orderTotal.total,
        is_free_delivery: orderTotal.is_free_delivery,
        delivery_address,
        special_instructions
      }, { transaction });

      for (const item of itemsWithPrices) {
        await OrderItem.create({
          order_id: order.order_id,
          item_id: item.item_id,
          quantity: item.quantity,
          price_at_order: item.price,
          chef_id: item.chef_id
        }, { transaction });
      }

      await Transaction.create({
        customer_id: customer.customer_id,
        transaction_type: 'order',
        amount: -orderTotal.total,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        order_id: order.order_id,
        description: `Order #${order.order_id}`
      }, { transaction });

      await transaction.commit();

      await customerService.checkVipEligibility(customer.customer_id);

      return {
        order_id: order.order_id,
        total: orderTotal.total,
        message: 'Order placed successfully'
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getOrderById(orderId, userId) {
    const customer = await Customer.findOne({ where: { user_id: userId } });

    const order = await Order.findByPk(orderId, {
      include: [
        {
          model: OrderItem,
          include: [MenuItem]
        }
      ]
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.customer_id !== customer.customer_id) {
      throw new Error('Unauthorized');
    }

    return order;
  }

  async getCustomerOrders(userId, limit = 20) {
    const customer = await Customer.findOne({ where: { user_id: userId } });

    const orders = await Order.findAll({
      where: { customer_id: customer.customer_id },
      include: [
        {
          model: OrderItem,
          include: [MenuItem]
        }
      ],
      order: [['created_at', 'DESC']],
      limit
    });

    return orders;
  }
}

module.exports = new OrderService();
