const chatService = require('../services/chatService');

const createSession = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null;
    const session = await chatService.createSession(userId);
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await chatService.endSession(parseInt(sessionId));
    res.json({ success: true, data: session });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const result = await chatService.sendMessage(parseInt(sessionId), content);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const rateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { rating } = req.body;

    if (rating === null || rating === undefined || rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5' });
    }

    const message = await chatService.rateMessage(parseInt(messageId), rating);
    res.json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSessionHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await chatService.getSessionHistory(parseInt(sessionId));
    res.json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFlaggedArticles = async (req, res) => {
  try {
    const articles = await chatService.getFlaggedArticles();
    res.json({ success: true, data: articles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const article = await chatService.deleteArticle(parseInt(articleId));
    res.json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const unflagArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const article = await chatService.unflagArticle(parseInt(articleId));
    res.json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createSession,
  endSession,
  sendMessage,
  rateMessage,
  getSessionHistory,
  getFlaggedArticles,
  deleteArticle,
  unflagArticle
};
