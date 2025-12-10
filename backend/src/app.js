const express = require('express');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const customerRoutes = require('./routes/customer');
const orderRoutes = require('./routes/order');
const chefRoutes = require('./routes/chef');
const deliveryRoutes = require('./routes/delivery');
const biddingRoutes = require('./routes/bidding');
const employeeRoutes = require('./routes/employee');
const ratingRoutes = require('./routes/ratings');
const complaintRoutes = require('./routes/complaints');
const performanceRoutes = require('./routes/performance');
const vipRoutes = require('./routes/vip');

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
app.use('/api/chef', chefRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/bidding', biddingRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/vip', vipRoutes);

app.use(errorHandler);

module.exports = app;
