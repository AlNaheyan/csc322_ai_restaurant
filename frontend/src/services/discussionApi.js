import api from './api';

export const discussionApi = {
  getAllTopics: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.target_type) params.append('target_type', filters.target_type);

    const response = await api.get(`/discussions?${params.toString()}`);
    return response.data;
  },

  getTopicById: async (topicId) => {
    const response = await api.get(`/discussions/${topicId}`);
    return response.data;
  },

  createTopic: async (topicData) => {
    const response = await api.post('/discussions', topicData);
    return response.data;
  },

  createPost: async (topicId, content) => {
    const response = await api.post(`/discussions/${topicId}/posts`, { content });
    return response.data;
  },

  lockTopic: async (topicId) => {
    const response = await api.put(`/discussions/${topicId}/lock`);
    return response.data;
  },

  unlockTopic: async (topicId) => {
    const response = await api.put(`/discussions/${topicId}/unlock`);
    return response.data;
  },

  reportPost: async (postId, reason) => {
    const response = await api.post(`/discussions/posts/${postId}/report`, { reason });
    return response.data;
  },

  deleteTopic: async (topicId) => {
    const response = await api.delete(`/discussions/${topicId}`);
    return response.data;
  },

  deletePost: async (postId) => {
    const response = await api.delete(`/discussions/posts/${postId}`);
    return response.data;
  }
};
