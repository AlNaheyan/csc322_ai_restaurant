const { MenuItem, Employee, User, OrderItem, Order } = require('../models');
const { Op } = require('sequelize');

class ChefService {
  async getChefProfile(userId) {
    const employee = await Employee.findOne({
      where: { user_id: userId },
      include: [{
        model: User,
        attributes: ['user_id', 'email', 'first_name', 'last_name', 'phone']
      }]
    });

    if (!employee) {
      throw new Error('Chef profile not found');
    }

    return employee;
  }

  async getMyMenuItems(chefId) {
    const menuItems = await MenuItem.findAll({
      where: { chef_id: chefId },
      order: [['created_at', 'DESC']]
    });

    return menuItems;
  }

  async createMenuItem(chefId, itemData) {
    const menuItem = await MenuItem.create({
      ...itemData,
      chef_id: chefId
    });

    return menuItem;
  }

  async updateMyMenuItem(chefId, itemId, itemData) {
    const menuItem = await MenuItem.findOne({
      where: { item_id: itemId, chef_id: chefId }
    });

    if (!menuItem) {
      throw new Error('Menu item not found or you do not have permission to update it');
    }

    await menuItem.update(itemData);
    return menuItem;
  }

  async deleteMyMenuItem(chefId, itemId) {
    const menuItem = await MenuItem.findOne({
      where: { item_id: itemId, chef_id: chefId }
    });

    if (!menuItem) {
      throw new Error('Menu item not found or you do not have permission to delete it');
    }

    const hasOrders = await OrderItem.count({
      where: { item_id: itemId }
    });

    if (hasOrders > 0) {
      await menuItem.update({ is_available: false });
      return {
        message: 'Menu item has existing orders and cannot be deleted. It has been marked as unavailable instead.',
        marked_unavailable: true
      };
    }

    await menuItem.destroy();
    return { message: 'Menu item deleted successfully' };
  }

  async getMyOrders(chefId) {
    const orders = await Order.findAll({
      where: {
        status: {
          [Op.in]: ['pending', 'confirmed', 'preparing', 'ready_for_delivery']
        }
      },
      include: [{
        model: OrderItem,
        where: { chef_id: chefId },
        include: [{
          model: MenuItem,
          attributes: ['name', 'price']
        }]
      }],
      order: [['created_at', 'DESC']],
      limit: 50
    });

    return orders;
  }

  async getDashboardStats(chefId) {
    const menuItemCount = await MenuItem.count({
      where: { chef_id: chefId }
    });

    const activeItemCount = await MenuItem.count({
      where: { chef_id: chefId, is_available: true }
    });

    const totalOrders = await OrderItem.count({
      where: { chef_id: chefId }
    });

    const employee = await Employee.findByPk(chefId);

    return {
      menu_items_count: menuItemCount,
      active_items_count: activeItemCount,
      total_orders: totalOrders,
      average_rating: employee?.average_rating || 0,
      total_ratings: employee?.total_ratings || 0,
      complaint_count: employee?.complaint_count || 0,
      compliment_count: employee?.compliment_count || 0
    };
  }

  async markOrderReady(orderId, chefId) {
    const order = await Order.findByPk(orderId, {
      include: [{
        model: OrderItem,
        where: { chef_id: chefId }
      }]
    });

    if (!order) {
      throw new Error('Order not found or you do not have items in this order');
    }

    if (order.status === 'ready_for_delivery') {
      throw new Error('Order is already marked as ready');
    }

    await order.update({ status: 'ready_for_delivery' });

    // Try to emit socket event, but don't fail if socket service is unavailable
    try {
      const socketService = require('./socketService');
      if (socketService && socketService.emitToDelivery) {
        socketService.emitToDelivery('new_order_ready', {
          orderId: order.order_id,
          orderDetails: order
        });
      }
    } catch (err) {
      console.log('Socket service not available:', err.message);
    }

    return { message: 'Order marked as ready for delivery', order };
  }
}

module.exports = new ChefService();
