const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ManagerMemo = sequelize.define('ManagerMemo', {
  memo_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  manager_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  reference_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      isIn: [['delivery_bid', 'performance_override', 'complaint_decision', 'warning_override']]
    }
  },
  reference_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  memo_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'manager_memos',
  timestamps: false
});

module.exports = ManagerMemo;
