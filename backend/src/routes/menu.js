const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.get('/', menuController.getAll);
router.get('/popular', menuController.getPopular);
router.get('/top-rated', menuController.getTopRated);
router.get('/:id', menuController.getById);

router.post('/', authenticate, requireRole('chef', 'manager'), menuController.create);
router.put('/:id', authenticate, requireRole('chef', 'manager'), menuController.update);
router.delete('/:id', authenticate, requireRole('chef', 'manager'), menuController.delete);

module.exports = router;
