const express = require('express');
const router = express.Router();
const discussionController = require('../controllers/discussionController');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.get('/', discussionController.getAllTopics);

router.get('/:topicId', discussionController.getTopicById);

router.post('/', authenticate, requireRole('customer', 'vip', 'chef', 'delivery'), discussionController.createTopic);

router.post('/:topicId/posts', authenticate, requireRole('customer', 'vip', 'chef', 'delivery'), discussionController.createPost);

router.put('/:topicId/lock', authenticate, requireRole('manager'), discussionController.lockTopic);

router.put('/:topicId/unlock', authenticate, requireRole('manager'), discussionController.unlockTopic);

router.post('/posts/:postId/report', authenticate, requireRole('customer', 'vip', 'chef', 'delivery', 'manager'), discussionController.reportPost);

router.delete('/:topicId', authenticate, discussionController.deleteTopic);

router.delete('/posts/:postId', authenticate, discussionController.deletePost);

module.exports = router;
