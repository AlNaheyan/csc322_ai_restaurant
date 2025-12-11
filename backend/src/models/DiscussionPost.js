const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DiscussionPost = sequelize.define('DiscussionPost', {
  post_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  topic_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'discussion_topics',
      key: 'topic_id'
    },
    onDelete: 'CASCADE'
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  is_reported: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'discussion_posts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = DiscussionPost;
