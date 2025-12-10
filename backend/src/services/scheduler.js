const cron = require('node-cron');
const performanceService = require('./performanceService');
const vipService = require('./vipService');

function startScheduledTasks() {
  cron.schedule('0 2 * * *', async () => {
    console.log('Running daily performance evaluation...');
    try {
      const results = await performanceService.evaluateAllEmployees();
      console.log('Performance evaluation completed:', results);
    } catch (err) {
      console.error('Error running performance evaluation:', err);
    }
  });

  cron.schedule('0 3 * * *', async () => {
    console.log('Running VIP status check...');
    try {
      const results = await vipService.checkAllCustomersVipStatus();
      console.log('VIP status check completed:', results);
    } catch (err) {
      console.error('Error running VIP status check:', err);
    }
  });

  console.log('Scheduled tasks initialized');
}

module.exports = { startScheduledTasks };
