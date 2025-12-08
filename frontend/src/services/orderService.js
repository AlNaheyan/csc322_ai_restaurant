import api from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  getMyOrders: async (limit = 20) => {
    const response = await api.get(`/orders/my-orders?limit=${limit}`);
    return response.data;
  }
};
