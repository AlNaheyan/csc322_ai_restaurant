const { sequelize } = require('../config/database');
const { Customer, Order, OrderItem, Employee, Transaction, Complaint, Rating, MenuItem, User } = require('../models');
const { QueryTypes } = require('sequelize');

class AnalyticsService {
  async getOverviewStats() {
    const totalRevenue = await Transaction.sum('amount', {
      where: { transaction_type: 'order' }
    }) || 0;

    const totalOrders = await Order.count();

    const totalCustomers = await Customer.count({
      where: { registration_status: 'approved' }
    });

    const vipCustomers = await Customer.count({
      where: { is_vip: true }
    });

    const pendingRegistrations = await Customer.count({
      where: { registration_status: 'pending' }
    });

    const pendingComplaints = await Complaint.count({
      where: { status: 'pending' }
    });

    const activeEmployees = await Employee.count({
      where: { termination_date: null }
    });

    return {
      totalRevenue: parseFloat(totalRevenue).toFixed(2),
      totalOrders,
      totalCustomers,
      vipCustomers,
      pendingRegistrations,
      pendingComplaints,
      activeEmployees
    };
  }

  async getRevenueAnalytics(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const revenueByDay = await sequelize.query(`
      SELECT
        DATE(created_at) as date,
        SUM(total) as revenue,
        COUNT(*) as order_count
      FROM orders
      WHERE created_at >= :startDate
      AND status IN ('delivered', 'ready_for_delivery', 'out_for_delivery')
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, {
      replacements: { startDate },
      type: QueryTypes.SELECT
    });

    const totalRevenue = await Order.sum('total', {
      where: {
        created_at: { [sequelize.Sequelize.Op.gte]: startDate },
        status: { [sequelize.Sequelize.Op.in]: ['delivered', 'ready_for_delivery', 'out_for_delivery'] }
      }
    }) || 0;

    const avgOrderValue = totalRevenue / (await Order.count({
      where: {
        created_at: { [sequelize.Sequelize.Op.gte]: startDate }
      }
    }) || 1);

    return {
      revenueByDay: revenueByDay.map(row => ({
        date: row.date,
        revenue: parseFloat(row.revenue).toFixed(2),
        orderCount: parseInt(row.order_count)
      })),
      totalRevenue: parseFloat(totalRevenue).toFixed(2),
      avgOrderValue: parseFloat(avgOrderValue).toFixed(2)
    };
  }

  async getOrderAnalytics() {
    const statusDistribution = await Order.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('order_id')), 'count']
      ],
      group: ['status']
    });

    const recentOrders = await Order.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Customer,
          include: [{ model: User, attributes: ['first_name', 'last_name', 'email'] }]
        }
      ]
    });

    return {
      statusDistribution: statusDistribution.map(item => ({
        status: item.status,
        count: parseInt(item.dataValues.count)
      })),
      recentOrders: recentOrders.map(order => ({
        order_id: order.order_id,
        customer_name: `${order.Customer.User.first_name} ${order.Customer.User.last_name}`,
        total: parseFloat(order.total).toFixed(2),
        status: order.status,
        created_at: order.created_at
      }))
    };
  }

  async getCustomerAnalytics() {
    const customerStats = {
      total: await Customer.count({ where: { registration_status: 'approved' } }),
      vip: await Customer.count({ where: { is_vip: true } }),
      pending: await Customer.count({ where: { registration_status: 'pending' } }),
      rejected: await Customer.count({ where: { registration_status: 'rejected' } })
    };

    const topSpenders = await Customer.findAll({
      limit: 10,
      order: [['total_spent', 'DESC']],
      include: [{ model: User, attributes: ['first_name', 'last_name', 'email'] }]
    });

    const customerGrowth = await sequelize.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as new_customers
      FROM customers
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, {
      type: QueryTypes.SELECT
    });

    return {
      stats: customerStats,
      topSpenders: topSpenders.map(customer => ({
        customer_id: customer.customer_id,
        name: `${customer.User.first_name} ${customer.User.last_name}`,
        email: customer.User.email,
        total_spent: parseFloat(customer.total_spent).toFixed(2),
        order_count: customer.order_count,
        is_vip: customer.is_vip
      })),
      customerGrowth: customerGrowth.map(row => ({
        date: row.date,
        newCustomers: parseInt(row.new_customers)
      }))
    };
  }

  async getEmployeeAnalytics() {
    const employeeStats = {
      total: await Employee.count({ where: { termination_date: null } }),
      chefs: await Employee.count({ where: { employee_type: 'chef', termination_date: null } }),
      delivery: await Employee.count({ where: { employee_type: 'delivery', termination_date: null } })
    };

    const topPerformers = await Employee.findAll({
      limit: 10,
      order: [['average_rating', 'DESC']],
      where: { termination_date: null },
      include: [{ model: User, attributes: ['first_name', 'last_name', 'email'] }]
    });

    const ratingDistribution = await sequelize.query(`
      SELECT
        CASE
          WHEN average_rating >= 4.5 THEN '4.5-5.0'
          WHEN average_rating >= 4.0 THEN '4.0-4.5'
          WHEN average_rating >= 3.0 THEN '3.0-4.0'
          WHEN average_rating >= 2.0 THEN '2.0-3.0'
          ELSE '0-2.0'
        END as rating_range,
        COUNT(*) as count
      FROM employees
      WHERE termination_date IS NULL
      GROUP BY rating_range
    `, {
      type: QueryTypes.SELECT
    });

    return {
      stats: employeeStats,
      topPerformers: topPerformers.map(emp => ({
        employee_id: emp.employee_id,
        name: `${emp.User.first_name} ${emp.User.last_name}`,
        employee_type: emp.employee_type,
        average_rating: parseFloat(emp.average_rating).toFixed(2),
        total_ratings: emp.total_ratings,
        complaint_count: emp.complaint_count,
        compliment_count: emp.compliment_count
      })),
      ratingDistribution: ratingDistribution.map(row => ({
        range: row.rating_range,
        count: parseInt(row.count)
      }))
    };
  }

  async getComplaintAnalytics() {
    const complaintStats = {
      total: await Complaint.count(),
      pending: await Complaint.count({ where: { status: 'pending' } }),
      upheld: await Complaint.count({ where: { manager_decision: 'upheld' } }),
      dismissed: await Complaint.count({ where: { manager_decision: 'dismissed' } })
    };

    const complaintsByCategory = await Complaint.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('complaint_id')), 'count']
      ],
      group: ['category']
    });

    const complaintTrend = await sequelize.query(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as count
      FROM complaints
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, {
      type: QueryTypes.SELECT
    });

    return {
      stats: complaintStats,
      byCategory: complaintsByCategory.map(item => ({
        category: item.category,
        count: parseInt(item.dataValues.count)
      })),
      trend: complaintTrend.map(row => ({
        date: row.date,
        count: parseInt(row.count)
      }))
    };
  }

  async getMenuAnalytics() {
    const totalItems = await MenuItem.count({ where: { is_available: true } });

    const vipExclusiveItems = await MenuItem.count({
      where: { is_vip_only: true, is_available: true }
    });

    const topRatedItems = await MenuItem.findAll({
      limit: 10,
      order: [['average_rating', 'DESC']],
      where: { is_available: true },
      include: [{ model: Employee, include: [{ model: User, attributes: ['first_name', 'last_name'] }] }]
    });

    const mostPopularItems = await MenuItem.findAll({
      limit: 10,
      order: [['order_count', 'DESC']],
      where: { is_available: true },
      include: [{ model: Employee, include: [{ model: User, attributes: ['first_name', 'last_name'] }] }]
    });

    return {
      totalItems,
      vipExclusiveItems,
      topRatedItems: topRatedItems.map(item => ({
        item_id: item.item_id,
        name: item.name,
        price: parseFloat(item.price).toFixed(2),
        average_rating: parseFloat(item.average_rating).toFixed(2),
        total_ratings: item.total_ratings,
        chef_name: `${item.Employee.User.first_name} ${item.Employee.User.last_name}`
      })),
      mostPopularItems: mostPopularItems.map(item => ({
        item_id: item.item_id,
        name: item.name,
        price: parseFloat(item.price).toFixed(2),
        order_count: item.order_count,
        chef_name: `${item.Employee.User.first_name} ${item.Employee.User.last_name}`
      }))
    };
  }

  async getFinancialSummary(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const totalRevenue = await Order.sum('total', {
      where: {
        created_at: { [sequelize.Sequelize.Op.gte]: startDate },
        status: { [sequelize.Sequelize.Op.in]: ['delivered'] }
      }
    }) || 0;

    const totalTax = await Order.sum('tax', {
      where: {
        created_at: { [sequelize.Sequelize.Op.gte]: startDate },
        status: { [sequelize.Sequelize.Op.in]: ['delivered'] }
      }
    }) || 0;

    const totalDeliveryFees = await Order.sum('delivery_fee', {
      where: {
        created_at: { [sequelize.Sequelize.Op.gte]: startDate },
        status: { [sequelize.Sequelize.Op.in]: ['delivered'] }
      }
    }) || 0;

    const totalDiscounts = await Order.sum('discount', {
      where: {
        created_at: { [sequelize.Sequelize.Op.gte]: startDate }
      }
    }) || 0;

    const totalDeposits = await Transaction.sum('amount', {
      where: {
        transaction_type: 'deposit',
        created_at: { [sequelize.Sequelize.Op.gte]: startDate }
      }
    }) || 0;

    const totalRefunds = await Transaction.sum('amount', {
      where: {
        transaction_type: 'refund',
        created_at: { [sequelize.Sequelize.Op.gte]: startDate }
      }
    }) || 0;

    return {
      totalRevenue: parseFloat(totalRevenue).toFixed(2),
      totalTax: parseFloat(totalTax).toFixed(2),
      totalDeliveryFees: parseFloat(totalDeliveryFees).toFixed(2),
      totalDiscounts: parseFloat(totalDiscounts).toFixed(2),
      totalDeposits: parseFloat(totalDeposits).toFixed(2),
      totalRefunds: parseFloat(totalRefunds).toFixed(2),
      netRevenue: parseFloat(totalRevenue - totalDiscounts).toFixed(2)
    };
  }
}

module.exports = new AnalyticsService();
