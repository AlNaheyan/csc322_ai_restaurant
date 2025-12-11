const User = require('./User');
const Customer = require('./Customer');
const Employee = require('./Employee');
const MenuItem = require('./MenuItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Transaction = require('./Transaction');
const DeliveryBid = require('./DeliveryBid');
const ManagerMemo = require('./ManagerMemo');
const Rating = require('./Rating');
const Complaint = require('./Complaint');
const Warning = require('./Warning');
const PerformanceHistory = require('./PerformanceHistory');
const Blacklist = require('./Blacklist');
const KnowledgeBaseArticle = require('./KnowledgeBaseArticle');
const ChatSession = require('./ChatSession');
const ChatMessage = require('./ChatMessage');
const ArticleComment = require('./ArticleComment');
const DiscussionTopic = require('./DiscussionTopic');
const DiscussionPost = require('./DiscussionPost');

User.hasOne(Customer, { foreignKey: 'user_id' });
Customer.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Employee, { foreignKey: 'user_id' });
Employee.belongsTo(User, { foreignKey: 'user_id' });

Employee.hasMany(MenuItem, { foreignKey: 'chef_id' });
MenuItem.belongsTo(Employee, { foreignKey: 'chef_id', as: 'Chef' });

Customer.hasMany(Order, { foreignKey: 'customer_id' });
Order.belongsTo(Customer, { foreignKey: 'customer_id' });

Employee.hasMany(Order, { foreignKey: 'assigned_delivery_person' });
Order.belongsTo(Employee, { foreignKey: 'assigned_delivery_person', as: 'DeliveryPerson' });

Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

MenuItem.hasMany(OrderItem, { foreignKey: 'item_id' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'item_id' });

Customer.hasMany(Transaction, { foreignKey: 'customer_id' });
Transaction.belongsTo(Customer, { foreignKey: 'customer_id' });

Order.hasMany(DeliveryBid, { foreignKey: 'order_id' });
DeliveryBid.belongsTo(Order, { foreignKey: 'order_id' });

Employee.hasMany(DeliveryBid, { foreignKey: 'delivery_person_id' });
DeliveryBid.belongsTo(Employee, { foreignKey: 'delivery_person_id', as: 'DeliveryPerson' });

User.hasMany(ManagerMemo, { foreignKey: 'manager_id' });
ManagerMemo.belongsTo(User, { foreignKey: 'manager_id', as: 'Manager' });

// Rating associations
Customer.hasMany(Rating, { foreignKey: 'customer_id' });
Rating.belongsTo(Customer, { foreignKey: 'customer_id' });

Order.hasMany(Rating, { foreignKey: 'order_id' });
Rating.belongsTo(Order, { foreignKey: 'order_id' });

// Complaint associations
User.hasMany(Complaint, { foreignKey: 'filer_id', as: 'FiledComplaints' });
User.hasMany(Complaint, { foreignKey: 'subject_id', as: 'ReceivedComplaints' });
Complaint.belongsTo(User, { foreignKey: 'filer_id', as: 'Filer' });
Complaint.belongsTo(User, { foreignKey: 'subject_id', as: 'Subject' });
Complaint.belongsTo(User, { foreignKey: 'resolved_by', as: 'Resolver' });

// Warning associations
User.hasMany(Warning, { foreignKey: 'user_id' });
Warning.belongsTo(User, { foreignKey: 'user_id' });

// PerformanceHistory associations
Employee.hasMany(PerformanceHistory, { foreignKey: 'employee_id' });
PerformanceHistory.belongsTo(Employee, { foreignKey: 'employee_id' });

// Blacklist associations
User.hasMany(Blacklist, { foreignKey: 'user_id' });
Blacklist.belongsTo(User, { foreignKey: 'user_id', as: 'BlacklistedUser' });
Blacklist.belongsTo(User, { foreignKey: 'blacklisted_by', as: 'BlacklistedBy' });

// Chat associations
User.hasMany(ChatSession, { foreignKey: 'user_id' });
ChatSession.belongsTo(User, { foreignKey: 'user_id' });

ChatSession.hasMany(ChatMessage, { foreignKey: 'session_id' });
ChatMessage.belongsTo(ChatSession, { foreignKey: 'session_id' });

KnowledgeBaseArticle.hasMany(ChatMessage, { foreignKey: 'kb_article_id' });
ChatMessage.belongsTo(KnowledgeBaseArticle, { foreignKey: 'kb_article_id' });

User.hasMany(KnowledgeBaseArticle, { foreignKey: 'author_id' });
KnowledgeBaseArticle.belongsTo(User, { foreignKey: 'author_id', as: 'Author' });

KnowledgeBaseArticle.hasMany(ArticleComment, { foreignKey: 'article_id' });
ArticleComment.belongsTo(KnowledgeBaseArticle, { foreignKey: 'article_id' });

User.hasMany(ArticleComment, { foreignKey: 'user_id' });
ArticleComment.belongsTo(User, { foreignKey: 'user_id', as: 'Author' });

// Discussion associations
User.hasMany(DiscussionTopic, { foreignKey: 'created_by' });
DiscussionTopic.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });

DiscussionTopic.hasMany(DiscussionPost, { foreignKey: 'topic_id' });
DiscussionPost.belongsTo(DiscussionTopic, { foreignKey: 'topic_id' });

User.hasMany(DiscussionPost, { foreignKey: 'author_id' });
DiscussionPost.belongsTo(User, { foreignKey: 'author_id', as: 'Author' });

module.exports = {
  User,
  Customer,
  Employee,
  MenuItem,
  Order,
  OrderItem,
  Transaction,
  DeliveryBid,
  ManagerMemo,
  Rating,
  Complaint,
  Warning,
  PerformanceHistory,
  Blacklist,
  KnowledgeBaseArticle,
  ChatSession,
  ChatMessage,
  ArticleComment,
  DiscussionTopic,
  DiscussionPost
};
