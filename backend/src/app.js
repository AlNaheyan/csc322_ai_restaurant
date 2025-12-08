const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const customerRoutes = require('./routes/customer');
const orderRoutes = require('./routes/order');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/orders', orderRoutes);

app.use(errorHandler);

module.exports = app;
