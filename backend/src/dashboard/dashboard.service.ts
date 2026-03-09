import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: number, role: string) {
    const [taskStats, agentStats] = await Promise.all([
      this.getTaskStats(userId, role),
      this.getAgentStats(),
    ]);

    return {
      taskStats,
      agentStats,
    };
  }

  private async getTaskStats(userId: number, role: string) {
    let whereClause: any = {};

    // Managers see all tasks, others see only their tasks
    if (role !== 'manager') {
      whereClause = {
        OR: [
          { assignedTo: userId },
          { createdBy: userId },
        ],
      };
    }

    const [total, pending, inProgress, review, completed] = await Promise.all([
      this.prisma.task.count({ where: whereClause }),
      this.prisma.task.count({ where: { ...whereClause, status: 'pending' } }),
      this.prisma.task.count({ where: { ...whereClause, status: 'in_progress' } }),
      this.prisma.task.count({ where: { ...whereClause, status: 'review' } }),
      this.prisma.task.count({ where: { ...whereClause, status: 'completed' } }),
    ]);

    return {
      total,
      pending,
      inProgress,
      review,
      completed,
    };
  }

  private async getAgentStats() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        isAvailable: true,
        currentTasks: true,
        maxTasks: true,
        agentStatus: true,
      },
    });

    return users.map((user) => ({
      userId: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      role: user.role,
      status: user.agentStatus?.status || (user.isAvailable ? 'available' : 'offline'),
      currentTasks: user.currentTasks,
      maxTasks: user.maxTasks,
      isAvailable: user.isAvailable && user.currentTasks < user.maxTasks,
    }));
  }

  async getTasks(userId: number, role: string, filters?: { status?: string; limit?: number }) {
    const limit = filters?.limit || 10;
    let whereClause: any = {};

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    // Managers see all tasks, others see only their tasks
    if (role !== 'manager') {
      whereClause = {
        ...whereClause,
        OR: [
          { assignedTo: userId },
          { createdBy: userId },
        ],
      };
    }

    return this.prisma.task.findMany({
      where: whereClause,
      include: {
        creator: {
          select: { id: true, username: true, displayName: true },
        },
        assignee: {
          select: { id: true, username: true, displayName: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
  }

  async getStats(userId: number, role: string) {
    let whereClause: any = {};

    if (role !== 'manager') {
      whereClause = {
        OR: [
          { assignedTo: userId },
          { createdBy: userId },
        ],
      };
    }

    const [completed, inProgress, pending] = await Promise.all([
      this.prisma.task.count({ where: { ...whereClause, status: 'completed' } }),
      this.prisma.task.count({ where: { ...whereClause, status: 'in_progress' } }),
      this.prisma.task.count({ where: { ...whereClause, status: 'pending' } }),
    ]);

    return {
      completed,
      inProgress,
      pending,
    };
  }

  async getAgents() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        isAvailable: true,
        currentTasks: true,
        maxTasks: true,
        agentStatus: true,
      },
    });

    return users.map((user) => ({
      userId: user.id,
      username: user.username,
      displayName: user.displayName || user.username,
      role: user.role,
      status: user.agentStatus?.status || (user.isAvailable ? 'available' : 'offline'),
      currentTasks: user.currentTasks,
      maxTasks: user.maxTasks,
      availability: user.isAvailable && user.currentTasks < user.maxTasks ? 'available' : 'busy',
    }));
  }
}
