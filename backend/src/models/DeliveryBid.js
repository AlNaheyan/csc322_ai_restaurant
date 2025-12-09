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
  estimated_time_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 5,
      max: 180
    }
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'accepted', 'rejected', 'withdrawn']]
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
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
