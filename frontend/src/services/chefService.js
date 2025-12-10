import api from './api';

export const chefService = {
  async getDashboard() {
    const response = await api.get('/chef/dashboard');
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/chef/profile');
    return response.data;
  },

  async getMyMenuItems() {
    const response = await api.get('/chef/menu-items');
    return response.data;
  },

  async createMenuItem(itemData) {
    const response = await api.post('/chef/menu-items', itemData);
    return response.data;
  },

  async updateMenuItem(itemId, itemData) {
    const response = await api.put(`/chef/menu-items/${itemId}`, itemData);
    return response.data;
  },

  async deleteMenuItem(itemId) {
    const response = await api.delete(`/chef/menu-items/${itemId}`);
    return response.data;
  },

  async getMyOrders() {
    const response = await api.get('/chef/orders');
    return response.data;
  },

  async markOrderReady(orderId) {
    const response = await api.put(`/chef/orders/${orderId}/ready`);
    return response.data;
  }
};
