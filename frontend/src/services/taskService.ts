import api from './api';

export interface Task {
  id: number;
  title: string;
  description?: string;
  taskType: 'design' | 'development' | 'qa';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  createdBy: number;
  assignedTo?: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  creator?: any;
  assignee?: any;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  taskType: 'design' | 'development' | 'qa';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: number;
  dueDate?: string;
}

export const taskService = {
  getAll: async (params?: {
    status?: string;
    taskType?: string;
    assignee?: number;
    page?: number;
    pageSize?: number;
  }) => {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  getOne: async (id: number) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  create: async (data: CreateTaskData) => {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Task>) => {
    const response = await api.patch(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  claim: async (id: number) => {
    const response = await api.post(`/tasks/${id}/claim`);
    return response.data;
  },

  submitForReview: async (id: number) => {
    const response = await api.post(`/tasks/${id}/submit`);
    return response.data;
  },

  updateStatus: async (id: number, status: string) => {
    const response = await api.post(`/tasks/${id}/status`, { status });
    return response.data;
  },

  complete: async (id: number) => {
    const response = await api.post(`/tasks/${id}/complete`);
    return response.data;
  },
};
