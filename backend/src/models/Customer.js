const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
  customer_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    },
    onDelete: 'CASCADE'
  },
  registration_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending'
  },
  rejection_reason: {
    type: DataTypes.TEXT
  },
  rejection_date: {
    type: DataTypes.DATE
  },
  deposit_balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  cashback_balance: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  total_spent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  order_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  warning_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_vip: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  vip_upgraded_at: {
    type: DataTypes.DATE
  },
  free_delivery_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'customers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Customer;
