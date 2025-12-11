const { KnowledgeBaseArticle, ChatSession, ChatMessage, User, ArticleComment } = require('../models');
const { Op } = require('sequelize');
const axios = require('axios');

class ChatService {
  extractKeywords(query) {
    const stopwords = [
      'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'should', 'could', 'can', 'may', 'might', 'must',
      'what', 'when', 'where', 'who', 'why', 'how', 'which',
      'i', 'you', 'we', 'they', 'he', 'she', 'it', 'me', 'my',
      'your', 'our', 'their', 'this', 'that', 'these', 'those'
    ];

    const words = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word =>
        word.length > 2 &&
        !stopwords.includes(word)
      );

    return [...new Set(words)];
  }

  calculateRelevanceScore(query, keywords, article) {
    let score = 0;
    const titleLower = article.title.toLowerCase();
    const contentLower = article.content.toLowerCase();
    const queryLower = query.toLowerCase();

    if (titleLower.includes(queryLower)) {
      score += 0.5;
    }

    if (contentLower.includes(queryLower)) {
      score += 0.3;
    }

    keywords.forEach(keyword => {
      if (titleLower.includes(keyword)) {
        score += 0.15;
      }
    });

    keywords.forEach(keyword => {
      if (contentLower.includes(keyword)) {
        score += 0.05;
      }
    });

    if (article.is_manager_approved) {
      score += 0.1;
    }

    if (article.flag_count > 0) {
      score -= 0.05 * article.flag_count;
    }

    return Math.max(0, Math.min(1, score));
  }

  async searchKnowledgeBase(query) {
    try {
      const keywords = this.extractKeywords(query);

      if (keywords.length === 0) {
        return null;
      }

      const articles = await KnowledgeBaseArticle.findAll({
        where: {
          is_active: true
        }
      });

      if (articles.length === 0) {
        return null;
      }

      const scoredArticles = articles.map(article => ({
        article,
        score: this.calculateRelevanceScore(query, keywords, article)
      }));

      scoredArticles.sort((a, b) => b.score - a.score);

      const topResult = scoredArticles[0];

      if (topResult.score > 0.3) {
        await topResult.article.update({ view_count: topResult.article.view_count + 1 });
        return topResult.article;
      }

      return null;

    } catch (error) {
      console.error('KB search error:', error);
      return null;
    }
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
    return session.toJSON();
  }

  async endSession(sessionId) {
    const session = await ChatSession.findByPk(sessionId);
    if (session) {
      await session.update({
        ended_at: new Date(),
        is_active: false
      });
    }
    return session ? session.toJSON() : null;
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
      userMessage: userMessage.toJSON(),
      botMessage: botMessage.toJSON(),
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

    return message.toJSON();
  }

  async getSessionHistory(sessionId) {
    const messages = await ChatMessage.findAll({
      where: { session_id: sessionId },
      order: [['created_at', 'ASC']],
      include: [{ model: KnowledgeBaseArticle, attributes: ['article_id', 'title'] }]
    });

    return messages.map(m => m.toJSON());
  }

  async getFlaggedArticles() {
    const articles = await KnowledgeBaseArticle.findAll({
      where: {
        flag_count: { [Op.gt]: 0 },
        is_active: true
      },
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

  async createArticle(userId, articleData) {
    const { title, content, category } = articleData;

    const article = await KnowledgeBaseArticle.create({
      author_id: userId,
      title,
      content,
      category,
      is_manager_approved: false,
      is_active: true
    });

    return article.toJSON();
  }

  async getMyArticles(userId) {
    const articles = await KnowledgeBaseArticle.findAll({
      where: { author_id: userId },
      order: [['created_at', 'DESC']]
    });

    return articles.map(a => a.toJSON());
  }

  async getPendingArticles() {
    const articles = await KnowledgeBaseArticle.findAll({
      where: {
        is_manager_approved: false,
        is_active: true
      },
      include: [{ model: User, as: 'Author', attributes: ['user_id', 'email', 'first_name', 'last_name'] }],
      order: [['created_at', 'DESC']]
    });

    return articles.map(a => a.toJSON());
  }

  async approveArticle(articleId) {
    const article = await KnowledgeBaseArticle.findByPk(articleId);

    if (!article) {
      throw new Error('Article not found');
    }

    await article.update({ is_manager_approved: true });
    return article.toJSON();
  }

  async rejectArticle(articleId) {
    const article = await KnowledgeBaseArticle.findByPk(articleId);

    if (!article) {
      throw new Error('Article not found');
    }

    await article.update({ is_active: false });
    return article.toJSON();
  }

  async updateArticle(userId, articleId, articleData) {
    const article = await KnowledgeBaseArticle.findByPk(articleId);

    if (!article) {
      throw new Error('Article not found');
    }

    if (article.author_id !== userId) {
      throw new Error('Not authorized to edit this article');
    }

    if (article.is_manager_approved) {
      throw new Error('Cannot edit approved articles');
    }

    await article.update(articleData);
    return article.toJSON();
  }

  async getArticleById(articleId) {
    const article = await KnowledgeBaseArticle.findByPk(articleId, {
      include: [
        { model: User, as: 'Author', attributes: ['user_id', 'first_name', 'last_name', 'email'] },
        {
          model: ArticleComment,
          where: { is_deleted: false },
          required: false,
          include: [{ model: User, as: 'Author', attributes: ['user_id', 'first_name', 'last_name'] }],
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!article) {
      throw new Error('Article not found');
    }

    return article.toJSON();
  }

  async getArticleComments(articleId) {
    const comments = await ArticleComment.findAll({
      where: {
        article_id: articleId,
        is_deleted: false
      },
      include: [{ model: User, as: 'Author', attributes: ['user_id', 'first_name', 'last_name'] }],
      order: [['created_at', 'DESC']]
    });

    return comments.map(c => c.toJSON());
  }

  async createComment(userId, articleId, content) {
    const article = await KnowledgeBaseArticle.findByPk(articleId);

    if (!article) {
      throw new Error('Article not found');
    }

    if (!article.is_manager_approved) {
      throw new Error('Cannot comment on unapproved articles');
    }

    const comment = await ArticleComment.create({
      article_id: articleId,
      user_id: userId,
      content
    });

    const commentWithAuthor = await ArticleComment.findByPk(comment.comment_id, {
      include: [{ model: User, as: 'Author', attributes: ['user_id', 'first_name', 'last_name'] }]
    });

    return commentWithAuthor.toJSON();
  }

  async updateComment(userId, commentId, content) {
    const comment = await ArticleComment.findByPk(commentId);

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.user_id !== userId) {
      throw new Error('Not authorized to edit this comment');
    }

    const hoursSinceCreation = (Date.now() - new Date(comment.created_at).getTime()) / (1000 * 60 * 60);
    if (hoursSinceCreation > 24) {
      throw new Error('Can only edit comments within 24 hours');
    }

    await comment.update({ content, is_edited: true });

    const updatedComment = await ArticleComment.findByPk(commentId, {
      include: [{ model: User, as: 'Author', attributes: ['user_id', 'first_name', 'last_name'] }]
    });

    return updatedComment.toJSON();
  }

  async deleteComment(userId, commentId, isManager = false) {
    const comment = await ArticleComment.findByPk(commentId);

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (!isManager && comment.user_id !== userId) {
      throw new Error('Not authorized to delete this comment');
    }

    await comment.update({ is_deleted: true });
    return comment.toJSON();
  }
}

module.exports = new ChatService();
