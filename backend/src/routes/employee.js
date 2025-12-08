const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

router.get('/top-chefs', employeeController.getTopChefs);
router.get('/top-delivery', employeeController.getTopDeliveryPersons);

module.exports = router;
