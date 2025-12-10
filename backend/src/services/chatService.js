const { KnowledgeBaseArticle, ChatSession, ChatMessage } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');

class ChatService {
  async searchKnowledgeBase(query) {
    const keywords = query.toLowerCase().split(' ').filter(word => word.length > 3);

    if (keywords.length === 0) {
      return null;
    }

    const articles = await KnowledgeBaseArticle.findAll({
      where: {
        is_active: true,
        [Op.or]: [
          ...keywords.map(keyword => ({
            [Op.or]: [
              { title: { [Op.iLike]: `%${keyword}%` } },
              { content: { [Op.iLike]: `%${keyword}%` } }
            ]
          }))
        ]
      },
      order: [['helpful_count', 'DESC'], ['view_count', 'DESC']],
      limit: 1
    });

    if (articles.length > 0) {
      const article = articles[0];
      await article.update({ view_count: article.view_count + 1 });
      return article;
    }

    return null;
  }

  async queryOllama(question) {
    try {
      const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
      const response = await axios.post(`${ollamaUrl}/api/generate`, {
        model: 'llama2',
        prompt: `You are a helpful restaurant assistant. Answer this question concisely: ${question}`,
        stream: false
      }, {
        timeout: 30000
      });

      return response.data.response;
    } catch (error) {
      console.error('Ollama error:', error.message);
      throw new Error('LLM service unavailable');
    }
  }

  async createSession(userId = null) {
    const session = await ChatSession.create({
      user_id: userId,
      is_active: true
    });
    return session;
  }

  async endSession(sessionId) {
    const session = await ChatSession.findByPk(sessionId);
    if (session) {
      await session.update({
        ended_at: new Date(),
        is_active: false
      });
    }
    return session;
  }

  async sendMessage(sessionId, content) {
    const userMessage = await ChatMessage.create({
      session_id: sessionId,
      message_type: 'user',
      content,
      source: 'user'
    });

    let responseContent;
    let source;
    let kbArticleId = null;

    const kbArticle = await this.searchKnowledgeBase(content);

    if (kbArticle) {
      responseContent = kbArticle.content;
      source = 'knowledge_base';
      kbArticleId = kbArticle.article_id;
    } else {
      try {
        responseContent = await this.queryOllama(content);
        source = 'ollama';
      } catch (error) {
        responseContent = "I'm sorry, I couldn't find an answer to your question. Please try rephrasing or contact our staff for assistance.";
        source = 'fallback';
      }
    }

    const botMessage = await ChatMessage.create({
      session_id: sessionId,
      message_type: 'bot',
      content: responseContent,
      source,
      kb_article_id: kbArticleId
    });

    return {
      userMessage,
      botMessage,
      source,
      kb_article_id: kbArticleId
    };
  }

  async rateMessage(messageId, rating) {
    const message = await ChatMessage.findByPk(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    await message.update({ rating });

    if (rating === 0 && message.kb_article_id) {
      const article = await KnowledgeBaseArticle.findByPk(message.kb_article_id);
      if (article) {
        await article.update({
          is_flagged: true,
          flag_count: article.flag_count + 1
        });
      }
    } else if (rating >= 4 && message.kb_article_id) {
      const article = await KnowledgeBaseArticle.findByPk(message.kb_article_id);
      if (article) {
        await article.update({
          helpful_count: article.helpful_count + 1
        });
      }
    }

    return message;
  }

  async getSessionHistory(sessionId) {
    const messages = await ChatMessage.findAll({
      where: { session_id: sessionId },
      order: [['created_at', 'ASC']],
      include: [{ model: KnowledgeBaseArticle, attributes: ['article_id', 'title'] }]
    });

    return messages;
  }

  async getFlaggedArticles() {
    const articles = await KnowledgeBaseArticle.findAll({
      where: { is_flagged: true, is_active: true },
      include: [{ model: User, as: 'Author', attributes: ['user_id', 'email', 'first_name', 'last_name'] }],
      order: [['flag_count', 'DESC']]
    });

    return articles;
  }

  async deleteArticle(articleId) {
    const article = await KnowledgeBaseArticle.findByPk(articleId);

    if (!article) {
      throw new Error('Article not found');
    }

    await article.update({ is_active: false });
    return article;
  }

  async unflagArticle(articleId) {
    const article = await KnowledgeBaseArticle.findByPk(articleId);

    if (!article) {
      throw new Error('Article not found');
    }

    await article.update({ is_flagged: false });
    return article;
  }
}

module.exports = new ChatService();
