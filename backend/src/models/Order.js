const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  order_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customer_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'customers',
      key: 'customer_id'
    }
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pending'
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  delivery_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  cashback_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  cashback_awarded: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  is_free_delivery: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  delivery_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  special_instructions: {
    type: DataTypes.TEXT
  },
  assigned_delivery_person: {
    type: DataTypes.INTEGER,
    references: {
      model: 'employees',
      key: 'employee_id'
    }
  },
  estimated_delivery_time: {
    type: DataTypes.DATE
  },
  actual_delivery_time: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Order;
