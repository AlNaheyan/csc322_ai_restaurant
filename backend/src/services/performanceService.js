const { Employee, Rating, PerformanceHistory, User, Blacklist, Warning } = require('../models');
const { Op } = require('sequelize');

class PerformanceService {
  async evaluateEmployee(employeeId) {
    const employee = await Employee.findByPk(employeeId, {
      include: [{ model: User }]
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    const targetType = employee.employee_type === 'chef' ? 'food' : 'delivery';

    const ratings = await Rating.findAll({
      where: {
        target_id: employeeId,
        target_type: targetType
      }
    });

    if (ratings.length === 0) {
      return { message: 'No ratings to evaluate', employee_id: employeeId };
    }

    let totalWeight = 0;
    let weightedSum = 0;

    ratings.forEach(r => {
      const weight = r.is_vip_rating ? 2 : 1;
      weightedSum += r.rating * weight;
      totalWeight += weight;
    });

    const avgRating = weightedSum / totalWeight;
    const performanceScore = avgRating * 20;

    let actionTaken = null;
    let bonusAmount = null;
    let salaryChange = null;

    if (avgRating >= 4.5) {
      bonusAmount = parseFloat(employee.salary) * 0.10;
      actionTaken = 'bonus';
    } else if (avgRating >= 3.0) {
      actionTaken = 'none';
    } else if (avgRating >= 2.0) {
      salaryChange = parseFloat(employee.salary) * -0.05;
      actionTaken = 'demotion';
      await employee.update({
        salary: parseFloat(employee.salary) + salaryChange
      });
    } else {
      actionTaken = 'termination';
      await employee.User.update({ is_active: false });
      await Warning.create({
        user_id: employee.user_id,
        warning_type: 'poor_performance',
        source: 'automated_evaluation',
        reason: `Terminated due to poor performance rating: ${avgRating.toFixed(2)}`,
        is_active: true
      });
    }

    const history = await PerformanceHistory.create({
      employee_id: employeeId,
      evaluation_date: new Date(),
      rating_average: avgRating.toFixed(2),
      total_ratings: ratings.length,
      performance_score: performanceScore.toFixed(2),
      action_taken: actionTaken,
      bonus_amount: bonusAmount,
      salary_change: salaryChange,
      notes: `Automated evaluation based on ${ratings.length} ratings`
    });

    return {
      employee_id: employeeId,
      avg_rating: avgRating.toFixed(2),
      performance_score: performanceScore.toFixed(2),
      action_taken: actionTaken,
      bonus_amount: bonusAmount,
      salary_change: salaryChange,
      history_id: history.history_id
    };
  }

  async evaluateAllEmployees() {
    const employees = await Employee.findAll({
      include: [{ model: User, where: { is_active: true } }]
    });

    const results = {
      bonuses: [],
      demotions: [],
      terminations: [],
      no_action: [],
      total_evaluated: 0
    };

    for (const employee of employees) {
      try {
        const result = await this.evaluateEmployee(employee.employee_id);
        results.total_evaluated++;

        switch(result.action_taken) {
          case 'bonus':
            results.bonuses.push(employee.employee_id);
            break;
          case 'demotion':
            results.demotions.push(employee.employee_id);
            break;
          case 'termination':
            results.terminations.push(employee.employee_id);
            break;
          case 'none':
            results.no_action.push(employee.employee_id);
            break;
        }
      } catch (err) {
        console.error(`Error evaluating employee ${employee.employee_id}:`, err);
      }
    }

    return results;
  }

  async getEmployeePerformanceHistory(employeeId) {
    const history = await PerformanceHistory.findAll({
      where: { employee_id: employeeId },
      order: [['evaluation_date', 'DESC']],
      limit: 10
    });

    return history;
  }

  async getAllPerformanceHistory() {
    const history = await PerformanceHistory.findAll({
      include: [{
        model: Employee,
        include: [{ model: User, attributes: ['user_id', 'email', 'first_name', 'last_name'] }]
      }],
      order: [['evaluation_date', 'DESC']],
      limit: 50
    });

    return history;
  }

  async blacklistUser(userId, reason, blacklistedBy) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    await user.update({ is_blacklisted: true, is_active: false });

    const blacklist = await Blacklist.create({
      user_id: userId,
      reason,
      blacklisted_by: blacklistedBy,
      is_active: true
    });

    return blacklist;
  }

  async getBlacklist() {
    const blacklist = await Blacklist.findAll({
      where: { is_active: true },
      include: [
        { model: User, as: 'BlacklistedUser', attributes: ['user_id', 'email', 'first_name', 'last_name'] },
        { model: User, as: 'BlacklistedBy', attributes: ['user_id', 'email', 'first_name', 'last_name'] }
      ],
      order: [['blacklisted_at', 'DESC']]
    });

    return blacklist;
  }

  async removeFromBlacklist(blacklistId) {
    const blacklist = await Blacklist.findByPk(blacklistId);

    if (!blacklist) {
      throw new Error('Blacklist entry not found');
    }

    await blacklist.update({ is_active: false });

    const user = await User.findByPk(blacklist.user_id);
    if (user && user.is_blacklisted) {
      await user.update({ is_blacklisted: false, is_active: true });
    }

    return blacklist;
  }
}

module.exports = new PerformanceService();
