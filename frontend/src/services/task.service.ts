import api from './api';

export interface CreateTaskData {
  title: string;
  description?: string;
  taskType: string;
  priority?: string;
  assignedTo?: number;
  dueDate?: string;
}

export interface TaskFilters {
  status?: string;
  assignee?: number;
  taskType?: string;
  page?: number;
  pageSize?: number;
}

export const taskService = {
  async getAll(filters?: TaskFilters) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.assignee) params.append('assignee', filters.assignee.toString());
    if (filters?.taskType) params.append('taskType', filters.taskType);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.pageSize) params.append('pageSize', filters.pageSize.toString());

    const response = await api.get(`/tasks?${params.toString()}`);
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  async create(data: CreateTaskData) {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  async update(id: number, data: Partial<CreateTaskData>) {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  async claim(id: number) {
    const response = await api.post(`/tasks/${id}/claim`);
    return response.data;
  },

  async updateStatus(id: number, status: string) {
    const response = await api.post(`/tasks/${id}/status`, { status });
    return response.data;
  },
};
