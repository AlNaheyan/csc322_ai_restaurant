const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Complaint = sequelize.define('Complaint', {
  complaint_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  filer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  subject_type: {
    type: DataTypes.STRING(20),
    allowNull: false
    // 'chef', 'delivery', 'customer'
  },
  complaint_type: {
    type: DataTypes.STRING(20),
    allowNull: false
    // 'compliment', 'complaint'
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true
    // 'quality', 'behavior', 'delivery_issue', etc.
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  evidence_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending'
    // 'pending', 'under_review', 'resolved', 'dismissed'
  },
  manager_decision: {
    type: DataTypes.STRING(20),
    allowNull: true
    // 'upheld', 'dismissed'
  },
  manager_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolved_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  resolved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_vip_complaint: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  is_disputed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  dispute_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'complaints',
  timestamps: false
});

module.exports = Complaint;
