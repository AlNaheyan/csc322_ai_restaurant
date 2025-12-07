const User = require('./User');
const Customer = require('./Customer');
const Employee = require('./Employee');
const MenuItem = require('./MenuItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Transaction = require('./Transaction');

User.hasOne(Customer, { foreignKey: 'user_id' });
Customer.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Employee, { foreignKey: 'user_id' });
Employee.belongsTo(User, { foreignKey: 'user_id' });

Employee.hasMany(MenuItem, { foreignKey: 'chef_id' });
MenuItem.belongsTo(Employee, { foreignKey: 'chef_id', as: 'Chef' });

Customer.hasMany(Order, { foreignKey: 'customer_id' });
Order.belongsTo(Customer, { foreignKey: 'customer_id' });

Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

MenuItem.hasMany(OrderItem, { foreignKey: 'item_id' });
OrderItem.belongsTo(MenuItem, { foreignKey: 'item_id' });

Customer.hasMany(Transaction, { foreignKey: 'customer_id' });
Transaction.belongsTo(Customer, { foreignKey: 'customer_id' });

module.exports = {
  User,
  Customer,
  Employee,
  MenuItem,
  Order,
  OrderItem,
  Transaction
};
