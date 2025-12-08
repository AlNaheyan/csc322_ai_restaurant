import api from './api';

export const menuService = {
  getAllMenuItems: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await api.get(`/menu?${params}`);
    return response.data;
  },

  getMenuItemById: async (itemId) => {
    const response = await api.get(`/menu/${itemId}`);
    return response.data;
  },

  getPopularItems: async (limit = 10) => {
    const response = await api.get(`/menu/popular?limit=${limit}`);
    return response.data;
  },

  getTopRatedItems: async (limit = 10) => {
    const response = await api.get(`/menu/top-rated?limit=${limit}`);
    return response.data;
  }
};
