const User = require('./User');
const Customer = require('./Customer');
const Employee = require('./Employee');

User.hasOne(Customer, { foreignKey: 'user_id' });
Customer.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Employee, { foreignKey: 'user_id' });
Employee.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  User,
  Customer,
  Employee
};
