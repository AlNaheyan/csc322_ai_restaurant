const User = require('./User');
const Customer = require('./Customer');
const Employee = require('./Employee');
const MenuItem = require('./MenuItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Transaction = require('./Transaction');
const DeliveryBid = require('./DeliveryBid');
const ManagerMemo = require('./ManagerMemo');

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

Order.hasMany(DeliveryBid, { foreignKey: 'order_id' });
DeliveryBid.belongsTo(Order, { foreignKey: 'order_id' });

Employee.hasMany(DeliveryBid, { foreignKey: 'delivery_person_id' });
DeliveryBid.belongsTo(Employee, { foreignKey: 'delivery_person_id', as: 'DeliveryPerson' });

User.hasMany(ManagerMemo, { foreignKey: 'manager_id' });
ManagerMemo.belongsTo(User, { foreignKey: 'manager_id', as: 'Manager' });

module.exports = {
  User,
  Customer,
  Employee,
  MenuItem,
  Order,
  OrderItem,
  Transaction,
  DeliveryBid,
  ManagerMemo
};
