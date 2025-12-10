const performanceService = require('../services/performanceService');

const evaluateEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const result = await performanceService.evaluateEmployee(parseInt(employeeId));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const evaluateAllEmployees = async (req, res) => {
  try {
    const results = await performanceService.evaluateAllEmployees();
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEmployeePerformanceHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const history = await performanceService.getEmployeePerformanceHistory(parseInt(employeeId));
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getAllPerformanceHistory = async (req, res) => {
  try {
    const history = await performanceService.getAllPerformanceHistory();
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const blacklistUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    const blacklistedBy = req.user.userId;

    const blacklist = await performanceService.blacklistUser(parseInt(userId), reason, blacklistedBy);
    res.json({ success: true, data: blacklist });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getBlacklist = async (req, res) => {
  try {
    const blacklist = await performanceService.getBlacklist();
    res.json({ success: true, data: blacklist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const removeFromBlacklist = async (req, res) => {
  try {
    const { blacklistId } = req.params;
    const result = await performanceService.removeFromBlacklist(parseInt(blacklistId));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  evaluateEmployee,
  evaluateAllEmployees,
  getEmployeePerformanceHistory,
  getAllPerformanceHistory,
  blacklistUser,
  getBlacklist,
  removeFromBlacklist
};
