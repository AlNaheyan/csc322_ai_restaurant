const { DeliveryBid, Order, Employee, User, ManagerMemo } = require('../models');
const { Op } = require('sequelize');
const socketService = require('./socketService');

class BiddingService {
  async submitBid(deliveryPersonId, orderId, bidData) {
    const { bid_amount, estimated_time_minutes, notes } = bidData;

    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'ready') {
      throw new Error('Order is not ready for bidding');
    }

    if (order.assigned_delivery_person) {
      throw new Error('Order already has an assigned delivery person');
    }

    const existingBid = await DeliveryBid.findOne({
      where: {
        order_id: orderId,
        delivery_person_id: deliveryPersonId,
        status: 'pending'
      }
    });

    if (existingBid) {
      throw new Error('You already have a pending bid for this order');
    }

    const bid = await DeliveryBid.create({
      order_id: orderId,
      delivery_person_id: deliveryPersonId,
      bid_amount: parseFloat(bid_amount),
      estimated_time_minutes: parseInt(estimated_time_minutes),
      notes,
      status: 'pending'
    });

    socketService.notifyNewBid(orderId, bid);

    return bid;
  }

  async getBidsForOrder(orderId) {
    const bids = await DeliveryBid.findAll({
      where: {
        order_id: orderId,
        status: 'pending'
      },
      include: [
        {
          model: Employee,
          as: 'DeliveryPerson',
          include: [
            {
              model: User,
              attributes: ['first_name', 'last_name', 'email']
            }
          ]
        }
      ],
      order: [
        ['bid_amount', 'ASC'],
        ['estimated_time_minutes', 'ASC']
      ]
    });

    return bids;
  }

  async acceptBid(bidId, managerId, justification) {
    const bid = await DeliveryBid.findByPk(bidId);
    if (!bid) {
      throw new Error('Bid not found');
    }

    if (bid.status !== 'pending') {
      throw new Error('Bid is not pending');
    }

    const order = await Order.findByPk(bid.order_id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.assigned_delivery_person) {
      throw new Error('Order already assigned');
    }

    await bid.update({ status: 'accepted' });

    await Order.update(
      {
        assigned_delivery_person: bid.delivery_person_id,
        status: 'ready'
      },
      { where: { order_id: bid.order_id } }
    );

    await DeliveryBid.update(
      { status: 'rejected' },
      {
        where: {
          order_id: bid.order_id,
          bid_id: { [Op.ne]: bidId },
          status: 'pending'
        }
      }
    );

    if (justification) {
      await ManagerMemo.create({
        manager_id: managerId,
        reference_type: 'delivery_bid',
        reference_id: bidId,
        memo_text: justification
      });
    }

    socketService.notifyBidAccepted(bid, bid.delivery_person_id);

    const rejectedBids = await DeliveryBid.findAll({
      where: {
        order_id: bid.order_id,
        bid_id: { [Op.ne]: bidId },
        status: 'rejected'
      }
    });

    for (const rejectedBid of rejectedBids) {
      socketService.notifyBidRejected(rejectedBid, rejectedBid.delivery_person_id);
    }

    return { bid, message: 'Bid accepted and delivery assigned' };
  }

  async withdrawBid(bidId, deliveryPersonId) {
    const bid = await DeliveryBid.findOne({
      where: {
        bid_id: bidId,
        delivery_person_id: deliveryPersonId,
        status: 'pending'
      }
    });

    if (!bid) {
      throw new Error('Bid not found or cannot be withdrawn');
    }

    await bid.update({ status: 'withdrawn' });

    return { message: 'Bid withdrawn successfully' };
  }

  async getMyBids(deliveryPersonId, status = null) {
    const where = { delivery_person_id: deliveryPersonId };

    if (status) {
      where.status = status;
    }

    const bids = await DeliveryBid.findAll({
      where,
      include: [
        {
          model: Order,
          attributes: ['order_id', 'status', 'delivery_address', 'total', 'created_at']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 50
    });

    return bids;
  }
}

module.exports = new BiddingService();
