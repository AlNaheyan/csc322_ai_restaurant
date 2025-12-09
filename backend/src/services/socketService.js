const { Server } = require('socket.io');
const { verifyToken } = require('../config/jwt');

class SocketService {
  constructor() {
    this.io = null;
    this.deliveryPersonSockets = new Map();
    this.managerSockets = new Map();
    this.customerSockets = new Map();
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        credentials: true
      }
    });

    this.io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = verifyToken(token);
        if (!decoded) {
          return next(new Error('Invalid token'));
        }

        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId} (${socket.userRole})`);

      if (socket.userRole === 'delivery') {
        this.deliveryPersonSockets.set(socket.userId, socket.id);
      } else if (socket.userRole === 'manager') {
        this.managerSockets.set(socket.userId, socket.id);
      } else if (socket.userRole === 'customer' || socket.userRole === 'vip') {
        this.customerSockets.set(socket.userId, socket.id);
      }

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        this.deliveryPersonSockets.delete(socket.userId);
        this.managerSockets.delete(socket.userId);
        this.customerSockets.delete(socket.userId);
      });
    });
  }

  notifyNewOrderReady(order) {
    if (!this.io) return;

    this.deliveryPersonSockets.forEach((socketId) => {
      this.io.to(socketId).emit('new_order_ready', {
        order_id: order.order_id,
        customer_address: order.delivery_address,
        total: order.total,
        created_at: order.created_at
      });
    });

    this.managerSockets.forEach((socketId) => {
      this.io.to(socketId).emit('new_order_ready', {
        order_id: order.order_id,
        customer_address: order.delivery_address,
        total: order.total,
        created_at: order.created_at
      });
    });
  }

  notifyNewBid(orderId, bid) {
    if (!this.io) return;

    this.managerSockets.forEach((socketId) => {
      this.io.to(socketId).emit('new_bid', {
        order_id: orderId,
        bid_id: bid.bid_id,
        delivery_person_id: bid.delivery_person_id,
        bid_amount: bid.bid_amount,
        estimated_time_minutes: bid.estimated_time_minutes,
        created_at: bid.created_at
      });
    });
  }

  notifyBidAccepted(bid, deliveryPersonId) {
    if (!this.io) return;

    const socketId = this.deliveryPersonSockets.get(deliveryPersonId);
    if (socketId) {
      this.io.to(socketId).emit('bid_accepted', {
        bid_id: bid.bid_id,
        order_id: bid.order_id
      });
    }
  }

  notifyBidRejected(bid, deliveryPersonId) {
    if (!this.io) return;

    const socketId = this.deliveryPersonSockets.get(deliveryPersonId);
    if (socketId) {
      this.io.to(socketId).emit('bid_rejected', {
        bid_id: bid.bid_id,
        order_id: bid.order_id
      });
    }
  }

  notifyOrderStatusUpdate(order, customerId) {
    if (!this.io) return;

    const socketId = this.customerSockets.get(customerId);
    if (socketId) {
      this.io.to(socketId).emit('order_status_update', {
        order_id: order.order_id,
        status: order.status,
        updated_at: new Date()
      });
    }
  }
}

module.exports = new SocketService();
