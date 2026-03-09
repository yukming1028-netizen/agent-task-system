import api from './api';

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  getTasks: async (params?: { status?: string; limit?: number }) => {
    const response = await api.get('/dashboard/tasks', { params });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },

  getAgents: async () => {
    const response = await api.get('/dashboard/agents');
    return response.data;
  },
};
