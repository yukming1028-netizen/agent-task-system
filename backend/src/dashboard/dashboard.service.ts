import { Injectable } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class DashboardService {
  constructor(
    private tasksService: TasksService,
    private usersService: UsersService,
  ) {}

  async getSummary(userId: number, role: string) {
    const [tasks, allUsers] = await Promise.all([
      this.tasksService.findAll({
        createdBy: role === 'manager' ? userId : undefined,
        assignee: role !== 'manager' ? userId : undefined,
        page: 1,
        pageSize: 1000,
      }),
      this.usersService.findAll(),
    ]);

    const taskList = tasks.tasks;
    
    const stats = {
      total: taskList.length,
      pending: taskList.filter(t => t.status === 'pending').length,
      inProgress: taskList.filter(t => t.status === 'in_progress').length,
      completed: taskList.filter(t => t.status === 'completed').length,
      review: taskList.filter(t => t.status === 'review').length,
    };

    const agentStatus = allUsers.map(user => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      isAvailable: user.isAvailable,
      currentTasks: user.currentTasks,
      status: user.isAvailable && user.currentTasks < 5 ? 'available' : 'busy',
    }));

    return {
      stats,
      recentTasks: taskList.slice(0, 10),
      agentStatus,
    };
  }

  async getStats(userId: number, role: string) {
    const tasks = await this.tasksService.findAll({
      createdBy: role === 'manager' ? userId : undefined,
      assignee: role !== 'manager' ? userId : undefined,
      page: 1,
      pageSize: 1000,
    });

    const taskList = tasks.tasks;

    return {
      total: taskList.length,
      byStatus: {
        pending: taskList.filter(t => t.status === 'pending').length,
        inProgress: taskList.filter(t => t.status === 'in_progress').length,
        completed: taskList.filter(t => t.status === 'completed').length,
        review: taskList.filter(t => t.status === 'review').length,
        cancelled: taskList.filter(t => t.status === 'cancelled').length,
      },
      byPriority: {
        low: taskList.filter(t => t.priority === 'low').length,
        medium: taskList.filter(t => t.priority === 'medium').length,
        high: taskList.filter(t => t.priority === 'high').length,
        urgent: taskList.filter(t => t.priority === 'urgent').length,
      },
      byType: {
        design: taskList.filter(t => t.taskType === 'design').length,
        development: taskList.filter(t => t.taskType === 'development').length,
        qa: taskList.filter(t => t.taskType === 'qa').length,
      },
    };
  }

  async getAgents() {
    const users = await this.usersService.findAll();
    return users.map(user => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
      isAvailable: user.isAvailable,
      currentTasks: user.currentTasks,
      status: user.isAvailable && user.currentTasks < 5 ? 'available' : 'busy',
    }));
  }
}
