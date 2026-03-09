import api from './api';

export const dashboardService = {
  async getSummary() {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  async getAgents() {
    const response = await api.get('/dashboard/agents');
    return response.data;
  },
};
