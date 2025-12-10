const vipService = require('../services/vipService');

const checkVipStatus = async (req, res) => {
  try {
    const { customerId } = req.params;
    const result = await vipService.checkAndUpgradeVipStatus(parseInt(customerId));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const checkAllVipStatus = async (req, res) => {
  try {
    const results = await vipService.checkAllCustomersVipStatus();
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getVipCustomers = async (req, res) => {
  try {
    const vipCustomers = await vipService.getVipCustomers();
    res.json({ success: true, data: vipCustomers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  checkVipStatus,
  checkAllVipStatus,
  getVipCustomers
};
