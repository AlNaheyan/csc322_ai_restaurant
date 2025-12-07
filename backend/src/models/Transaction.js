const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  transaction_id: {
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
  transaction_type: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  balance_before: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  balance_after: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  order_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'orders',
      key: 'order_id'
    }
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Transaction;
