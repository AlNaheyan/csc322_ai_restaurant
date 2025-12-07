const { MenuItem, Employee, User } = require('../models');
const { Op } = require('sequelize');

class MenuService {
  async getAllMenuItems(filters = {}) {
    const { chefId, minPrice, maxPrice, minRating, isVipOnly, isAvailable = true } = filters;

    const where = { is_available: isAvailable };

    if (chefId) where.chef_id = chefId;
    if (minPrice) where.price = { [Op.gte]: minPrice };
    if (maxPrice) where.price = { ...where.price, [Op.lte]: maxPrice };
    if (minRating) where.average_rating = { [Op.gte]: minRating };
    if (isVipOnly !== undefined) where.is_vip_only = isVipOnly;

    const items = await MenuItem.findAll({
      where,
      include: [{
        model: Employee,
        as: 'Chef',
        include: [{ model: User, attributes: ['first_name', 'last_name'] }]
      }],
      order: [['order_count', 'DESC'], ['average_rating', 'DESC']]
    });

    return items;
  }

  async getMenuItemById(itemId) {
    const item = await MenuItem.findByPk(itemId, {
      include: [{
        model: Employee,
        as: 'Chef',
        include: [{ model: User, attributes: ['first_name', 'last_name'] }]
      }]
    });

    if (!item) {
      throw new Error('Menu item not found');
    }

    return item;
  }

  async getPopularItems(limit = 10) {
    return await MenuItem.findAll({
      where: { is_available: true },
      order: [['order_count', 'DESC']],
      limit
    });
  }

  async getTopRatedItems(limit = 10) {
    return await MenuItem.findAll({
      where: { is_available: true },
      order: [['average_rating', 'DESC'], ['total_ratings', 'DESC']],
      limit
    });
  }

  async createMenuItem(itemData) {
    return await MenuItem.create(itemData);
  }

  async updateMenuItem(itemId, itemData) {
    const item = await MenuItem.findByPk(itemId);
    if (!item) {
      throw new Error('Menu item not found');
    }

    await item.update(itemData);
    return item;
  }

  async deleteMenuItem(itemId) {
    const item = await MenuItem.findByPk(itemId);
    if (!item) {
      throw new Error('Menu item not found');
    }

    await item.update({ is_available: false });
    return { message: 'Menu item deleted successfully' };
  }
}

module.exports = new MenuService();
