const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Warning = sequelize.define('Warning', {
  warning_id: {
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
    }
  },
  warning_type: {
    type: DataTypes.STRING(50),
    allowNull: false
    // 'complaint_upheld', 'insufficient_balance', 'false_complaint'
  },
  source: {
    type: DataTypes.STRING(50),
    allowNull: true
    // 'complaint', 'system', 'manager'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  issued_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'warnings',
  timestamps: false
});

module.exports = Warning;
