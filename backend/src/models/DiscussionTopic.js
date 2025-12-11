const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DiscussionTopic = sequelize.define('DiscussionTopic', {
  topic_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    comment: 'chef, dish, delivery, general'
  },
  target_type: {
    type: DataTypes.STRING(20),
    comment: 'chef, menu_item, delivery_person, null'
  },
  target_id: {
    type: DataTypes.INTEGER,
    comment: 'Related entity ID'
  },
  is_locked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'discussion_topics',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DiscussionTopic;
