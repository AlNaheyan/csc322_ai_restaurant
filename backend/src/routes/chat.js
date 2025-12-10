const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/sessions', chatController.createSession);
router.post('/sessions/:sessionId/end', chatController.endSession);
router.post('/sessions/:sessionId/messages', chatController.sendMessage);
router.get('/sessions/:sessionId/history', chatController.getSessionHistory);
router.post('/messages/:messageId/rate', chatController.rateMessage);

router.get('/articles/flagged', authenticate, authorize(['manager']), chatController.getFlaggedArticles);
router.delete('/articles/:articleId', authenticate, authorize(['manager']), chatController.deleteArticle);
router.post('/articles/:articleId/unflag', authenticate, authorize(['manager']), chatController.unflagArticle);

module.exports = router;
