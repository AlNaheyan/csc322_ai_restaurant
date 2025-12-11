const customerService = require("../services/customerService");
const analyticsService = require("../services/analyticsService");

class ManagerController {
  async getPendingRegistrations(req, res, next) {
    try {
      const pendingCustomers = await customerService.getPendingRegistrations();
      res.json(pendingCustomers);
    } catch (error) {
      next(error);
    }
  }

  async approveRegistration(req, res, next) {
    try {
      const { customerId } = req.params;
      const result = await customerService.approveRegistration(
        parseInt(customerId)
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async rejectRegistration(req, res, next) {
    try {
      const { customerId } = req.params;
      const { reason } = req.body;

      if (!reason || reason.trim().length === 0) {
        return res.status(400).json({ error: "Rejection reason is required" });
      }

      const result = await customerService.rejectRegistration(
        parseInt(customerId),
        reason
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getOverviewStats(req, res, next) {
    try {
      const stats = await analyticsService.getOverviewStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  async getRevenueAnalytics(req, res, next) {
    try {
      const days = parseInt(req.query.days) || 30;
      const analytics = await analyticsService.getRevenueAnalytics(days);
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }

  async getOrderAnalytics(req, res, next) {
    try {
      const analytics = await analyticsService.getOrderAnalytics();
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }

  async getCustomerAnalytics(req, res, next) {
    try {
      const analytics = await analyticsService.getCustomerAnalytics();
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeAnalytics(req, res, next) {
    try {
      const analytics = await analyticsService.getEmployeeAnalytics();
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }

  async getComplaintAnalytics(req, res, next) {
    try {
      const analytics = await analyticsService.getComplaintAnalytics();
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }

  async getMenuAnalytics(req, res, next) {
    try {
      const analytics = await analyticsService.getMenuAnalytics();
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }

  async getFinancialSummary(req, res, next) {
    try {
      const days = parseInt(req.query.days) || 30;
      const summary = await analyticsService.getFinancialSummary(days);
      res.json(summary);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ManagerController();
