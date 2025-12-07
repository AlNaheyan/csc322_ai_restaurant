const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  order_item_id: {
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
    },
    onDelete: 'CASCADE'
  },
  item_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'menu_items',
      key: 'item_id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  price_at_order: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  chef_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'employees',
      key: 'employee_id'
    }
  }
}, {
  tableName: 'order_items',
  timestamps: false
});

module.exports = OrderItem;
