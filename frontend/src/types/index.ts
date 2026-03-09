export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  displayName?: string;
  isAvailable?: boolean;
  currentTasks?: number;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  taskType: string;
  priority: string;
  status: string;
  createdBy: number;
  assignedTo?: number;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  creator?: User;
  assignee?: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  review: number;
}

export interface AgentStatus {
  id: number;
  username: string;
  displayName?: string;
  role: string;
  isAvailable: boolean;
  currentTasks: number;
  status: 'available' | 'busy';
}
