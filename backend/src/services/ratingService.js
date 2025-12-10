const { Rating, Customer, Order, Employee, MenuItem } = require('../models');
const { Op } = require('sequelize');

class RatingService {
  async submitRating(customerId, orderId, ratingData) {
    const { target_type, target_id, rating, comment } = ratingData;

    // Validate order belongs to customer
    const order = await Order.findOne({
      where: { order_id: orderId, customer_id: customerId }
    });

    if (!order) {
      throw new Error('Order not found or does not belong to you');
    }

    // Check if order is delivered
    if (order.status !== 'delivered') {
      throw new Error('You can only rate delivered orders');
    }

    // Check for duplicate rating
    const existingRating = await Rating.findOne({
      where: {
        order_id: orderId,
        target_type
      }
    });

    if (existingRating) {
      throw new Error('You have already rated this ' + target_type);
    }

    // Get customer to check VIP status
    const customer = await Customer.findByPk(customerId);

    // Create rating
    const newRating = await Rating.create({
      order_id: orderId,
      customer_id: customerId,
      target_type,
      target_id,
      rating,
      comment,
      is_vip_rating: customer.is_vip
    });

    // Update average rating
    await this.updateAverageRating(target_id, target_type);

    return newRating;
  }

  async updateAverageRating(targetId, targetType) {
    const ratings = await Rating.findAll({
      where: { target_id: targetId, target_type: targetType }
    });

    if (ratings.length === 0) return;

    // Calculate weighted average (VIP ratings count 2x)
    let totalWeight = 0;
    let weightedSum = 0;

    ratings.forEach(r => {
      const weight = r.is_vip_rating ? 2 : 1;
      weightedSum += r.rating * weight;
      totalWeight += weight;
    });

    const avgRating = (weightedSum / totalWeight).toFixed(2);

    // Update employee or menu item
    if (targetType === 'food') {
      await Employee.update(
        {
          average_rating: avgRating,
          total_ratings: ratings.length
        },
        { where: { employee_id: targetId } }
      );
    } else if (targetType === 'delivery') {
      await Employee.update(
        {
          average_rating: avgRating,
          total_ratings: ratings.length
        },
        { where: { employee_id: targetId } }
      );
    }

    return avgRating;
  }

  async getRatingsForEmployee(employeeId) {
    const ratings = await Rating.findAll({
      where: {
        target_id: employeeId,
        target_type: {
          [Op.in]: ['food', 'delivery']
        }
      },
      include: [
        {
          model: Customer,
          include: ['User']
        },
        {
          model: Order,
          attributes: ['order_id', 'created_at']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 50
    });

    return ratings;
  }

  async getRatingsForOrder(orderId) {
    const ratings = await Rating.findAll({
      where: { order_id: orderId }
    });

    return ratings;
  }
}

module.exports = new RatingService();
