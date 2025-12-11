const discussionService = require('../services/discussionService');

class DiscussionController {
  async getAllTopics(req, res, next) {
    try {
      const { category, target_type } = req.query;
      const topics = await discussionService.getAllTopics({ category, target_type });
      res.json(topics);
    } catch (error) {
      next(error);
    }
  }

  async getTopicById(req, res, next) {
    try {
      const { topicId } = req.params;
      const topic = await discussionService.getTopicById(topicId);
      res.json(topic);
    } catch (error) {
      next(error);
    }
  }

  async createTopic(req, res, next) {
    try {
      const userId = req.user.userId;
      const topic = await discussionService.createTopic(userId, req.body);
      res.status(201).json(topic);
    } catch (error) {
      next(error);
    }
  }

  async createPost(req, res, next) {
    try {
      const userId = req.user.userId;
      const { topicId } = req.params;
      const { content } = req.body;
      const post = await discussionService.createPost(userId, topicId, content);
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  }

  async lockTopic(req, res, next) {
    try {
      const { topicId } = req.params;
      const topic = await discussionService.lockTopic(topicId);
      res.json({ message: 'Topic locked successfully', topic });
    } catch (error) {
      next(error);
    }
  }

  async unlockTopic(req, res, next) {
    try {
      const { topicId } = req.params;
      const topic = await discussionService.unlockTopic(topicId);
      res.json({ message: 'Topic unlocked successfully', topic });
    } catch (error) {
      next(error);
    }
  }

  async reportPost(req, res, next) {
    try {
      const userId = req.user.userId;
      const { postId } = req.params;
      const { reason } = req.body;
      const result = await discussionService.reportPost(postId, userId, reason);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteTopic(req, res, next) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;
      const { topicId } = req.params;
      const result = await discussionService.deleteTopic(topicId, userId, userRole);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req, res, next) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;
      const { postId } = req.params;
      const result = await discussionService.deletePost(postId, userId, userRole);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DiscussionController();
