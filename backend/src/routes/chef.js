const express = require('express');
const router = express.Router();
const chefController = require('../controllers/chefController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.use(authenticate);
router.use(requireRole('chef'));

router.get('/profile', chefController.getProfile);
router.get('/dashboard', chefController.getDashboard);
router.get('/menu-items', chefController.getMyMenuItems);
router.post('/menu-items', chefController.createMenuItem);
router.put('/menu-items/:id', chefController.updateMenuItem);
router.delete('/menu-items/:id', chefController.deleteMenuItem);
router.get('/orders', chefController.getMyOrders);

module.exports = router;
