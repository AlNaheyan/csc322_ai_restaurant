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

router.post('/articles', authenticate, chatController.createArticle);
router.get('/articles/my-articles', authenticate, chatController.getMyArticles);
router.get('/articles/pending', authenticate, authorize(['manager']), chatController.getPendingArticles);
router.get('/articles/:articleId', chatController.getArticleById);
router.post('/articles/:articleId/approve', authenticate, authorize(['manager']), chatController.approveArticle);
router.post('/articles/:articleId/reject', authenticate, authorize(['manager']), chatController.rejectArticle);
router.put('/articles/:articleId', authenticate, chatController.updateArticle);

router.get('/articles/:articleId/comments', chatController.getArticleComments);
router.post('/articles/:articleId/comments', authenticate, chatController.createComment);
router.put('/comments/:commentId', authenticate, chatController.updateComment);
router.delete('/comments/:commentId', authenticate, chatController.deleteComment);

module.exports = router;
