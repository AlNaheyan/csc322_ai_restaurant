require('dotenv').config();
const app = require('./src/app');
const { sequelize, testConnection } = require('./src/config/database');
const http = require('http');
const socketService = require('./src/services/socketService');
const { startScheduledTasks } = require('./src/services/scheduler');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await testConnection();

    await sequelize.sync({ alter: false });
    console.log('Database synchronized');

    const server = http.createServer(app);

    socketService.initialize(server);
    console.log('Socket.io initialized');

    startScheduledTasks();
    console.log('Scheduled tasks initialized');

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
