const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DeliveryBid = sequelize.define('DeliveryBid', {
  bid_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'orders',
      key: 'order_id'
    }
  },
  delivery_person_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'employee_id'
    }
  },
  bid_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  estimated_time: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'estimated_time',
    validate: {
      min: 5,
      max: 180
    }
  },
  bid_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
    field: 'bid_status',
    validate: {
      isIn: [['pending', 'accepted', 'rejected', 'withdrawn']]
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'delivery_bids',
  timestamps: false
});

module.exports = DeliveryBid;
