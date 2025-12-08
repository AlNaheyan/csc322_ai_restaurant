import api from './api';

export const customerService = {
  getProfile: async () => {
    const response = await api.get('/customer/profile');
    return response.data;
  },

  addDeposit: async (amount) => {
    const response = await api.post('/customer/deposit', { amount });
    return response.data;
  },

  getTransactionHistory: async (limit = 50) => {
    const response = await api.get(`/customer/transactions?limit=${limit}`);
    return response.data;
  },

  closeAccount: async (reason) => {
    const response = await api.post('/customer/close-account', { reason });
    return response.data;
  }
};
