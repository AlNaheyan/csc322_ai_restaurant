const customerService = require("../services/customerService");
const analyticsService = require("../services/analyticsService");
const memoService = require("../services/memoService");
const discussionService = require("../services/discussionService");

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

  async createMemo(req, res, next) {
    try {
      const { referenceType, referenceId, memoText } = req.body;
      const memo = await memoService.createMemo(req.user.userId, referenceType, referenceId, memoText);
      res.status(201).json(memo);
    } catch (error) {
      next(error);
    }
  }

  async getMemosByReference(req, res, next) {
    try {
      const { referenceType, referenceId } = req.params;
      const memos = await memoService.getMemosByReference(referenceType, parseInt(referenceId));
      res.json(memos);
    } catch (error) {
      next(error);
    }
  }

  async getAllMemos(req, res, next) {
    try {
      const managerId = req.query.managerId ? parseInt(req.query.managerId) : null;
      const memos = await memoService.getAllMemos(managerId);
      res.json(memos);
    } catch (error) {
      next(error);
    }
  }

  async getMemoById(req, res, next) {
    try {
      const { memoId } = req.params;
      const memo = await memoService.getMemoById(parseInt(memoId));
      res.json(memo);
    } catch (error) {
      next(error);
    }
  }

  async updateMemo(req, res, next) {
    try {
      const { memoId } = req.params;
      const { memoText } = req.body;
      const memo = await memoService.updateMemo(parseInt(memoId), req.user.userId, memoText);
      res.json(memo);
    } catch (error) {
      next(error);
    }
  }

  async deleteMemo(req, res, next) {
    try {
      const { memoId } = req.params;
      const result = await memoService.deleteMemo(parseInt(memoId), req.user.userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getReportedPosts(req, res, next) {
    try {
      const reportedPosts = await discussionService.getReportedPosts();
      res.json(reportedPosts);
    } catch (error) {
      next(error);
    }
  }

  async unreportPost(req, res, next) {
    try {
      const { postId } = req.params;
      const result = await discussionService.unreportPost(parseInt(postId));
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteReportedPost(req, res, next) {
    try {
      const { postId } = req.params;
      const result = await discussionService.deletePost(parseInt(postId), req.user.userId, req.user.role);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ManagerController();
