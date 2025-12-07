const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Employee = sequelize.define('Employee', {
  employee_id: {
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
  employee_type: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  salary: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  average_rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  total_ratings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  complaint_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  compliment_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  demotion_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  hire_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  termination_date: {
    type: DataTypes.DATEONLY
  },
  is_available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  profile_picture_url: {
    type: DataTypes.STRING(500)
  },
  bio: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'employees',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Employee;
