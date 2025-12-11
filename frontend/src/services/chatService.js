import api from './api';

export const chatService = {
  createSession: async () => {
    const response = await api.post('/chat/sessions');
    return response.data;
  },

  endSession: async (sessionId) => {
    const response = await api.post(`/chat/sessions/${sessionId}/end`);
    return response.data;
  },

  sendMessage: async (sessionId, content) => {
    const response = await api.post(`/chat/sessions/${sessionId}/messages`, { content });
    return response.data;
  },

  rateMessage: async (messageId, rating) => {
    const response = await api.post(`/chat/messages/${messageId}/rate`, { rating });
    return response.data;
  },

  getSessionHistory: async (sessionId) => {
    const response = await api.get(`/chat/sessions/${sessionId}/history`);
    return response.data;
  },

  getFlaggedArticles: async () => {
    const response = await api.get('/chat/articles/flagged');
    return response.data;
  },

  deleteArticle: async (articleId) => {
    const response = await api.delete(`/chat/articles/${articleId}`);
    return response.data;
  },

  unflagArticle: async (articleId) => {
    const response = await api.post(`/chat/articles/${articleId}/unflag`);
    return response.data;
  },

  createArticle: async (articleData) => {
    const response = await api.post('/chat/articles', articleData);
    return response.data;
  },

  getMyArticles: async () => {
    const response = await api.get('/chat/articles/my-articles');
    return response.data;
  },

  getPendingArticles: async () => {
    const response = await api.get('/chat/articles/pending');
    return response.data;
  },

  approveArticle: async (articleId) => {
    const response = await api.post(`/chat/articles/${articleId}/approve`);
    return response.data;
  },

  rejectArticle: async (articleId) => {
    const response = await api.post(`/chat/articles/${articleId}/reject`);
    return response.data;
  },

  updateArticle: async (articleId, articleData) => {
    const response = await api.put(`/chat/articles/${articleId}`, articleData);
    return response.data;
  },

  getArticleById: async (articleId) => {
    const response = await api.get(`/chat/articles/${articleId}`);
    return response.data;
  },

  getArticleComments: async (articleId) => {
    const response = await api.get(`/chat/articles/${articleId}/comments`);
    return response.data;
  },

  createComment: async (articleId, content) => {
    const response = await api.post(`/chat/articles/${articleId}/comments`, { content });
    return response.data;
  },

  updateComment: async (commentId, content) => {
    const response = await api.put(`/chat/comments/${commentId}`, { content });
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/chat/comments/${commentId}`);
    return response.data;
  }
};
