const { User, Customer } = require('../models');
const { generateToken } = require('../config/jwt');
const { USER_ROLES } = require('../utils/constants');

class AuthService {
  async registerVisitor(userData) {
    const { email, password, first_name, last_name, phone } = userData;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const user = await User.create({
      email,
      password_hash: password,
      first_name,
      last_name,
      phone,
      role: USER_ROLES.VISITOR
    });

    const customer = await Customer.create({
      user_id: user.user_id,
      registration_status: 'pending'
    });

    return {
      message: 'Registration submitted. Awaiting manager approval.',
      user_id: user.user_id
    };
  }

  async login(email, password) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.is_blacklisted) {
      throw new Error('Account is blacklisted');
    }

    if (!user.is_active) {
      throw new Error('Account is inactive');
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    await user.update({ last_login: new Date() });

    const token = generateToken({ userId: user.user_id, role: user.role });

    return {
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    };
  }

  async getCurrentUser(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['user_id', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_active'],
      include: [
        {
          model: Customer,
          attributes: ['customer_id', 'deposit_balance', 'is_vip', 'warning_count', 'registration_status']
        }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}

module.exports = new AuthService();
