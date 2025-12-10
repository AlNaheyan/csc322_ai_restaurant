const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PerformanceHistory = sequelize.define('PerformanceHistory', {
  history_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  employee_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'employees',
      key: 'employee_id'
    }
  },
  evaluation_date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  rating_average: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true
  },
  total_ratings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  performance_score: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  action_taken: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  bonus_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  salary_change: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'performance_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = PerformanceHistory;
