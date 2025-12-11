const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const KnowledgeBaseArticle = sequelize.define('KnowledgeBaseArticle', {
  article_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  is_flagged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  flag_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_manager_approved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  helpful_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'knowledge_base_articles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = KnowledgeBaseArticle;
