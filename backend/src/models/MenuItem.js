const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MenuItem = sequelize.define('MenuItem', {
  item_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  chef_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'employees',
      key: 'employee_id'
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING(500)
  },
  is_vip_only: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  average_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  total_ratings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  order_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'menu_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MenuItem;
