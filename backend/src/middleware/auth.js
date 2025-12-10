const { verifyToken } = require('../config/jwt');
const { User, Customer, Employee } = require('../models');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await User.findByPk(decoded.userId);

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Invalid token or inactive user' });
    }

    req.user = {
      userId: user.user_id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name
    };

    // Attach customer_id if user is a customer
    if (user.role === 'customer' || user.role === 'vip') {
      const customer = await Customer.findOne({ where: { user_id: user.user_id } });
      if (customer) {
        req.user.customerId = customer.customer_id;
      }
    }

    // Attach employee_id if user is an employee
    if (user.role === 'chef' || user.role === 'delivery') {
      const employee = await Employee.findOne({ where: { user_id: user.user_id } });
      if (employee) {
        req.user.employeeId = employee.employee_id;
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

module.exports = { authenticate, authorize };
