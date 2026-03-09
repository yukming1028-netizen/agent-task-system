import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateTaskDto {
  title: string;
  description?: string;
  taskType: string;
  priority?: string;
  assignedTo?: number;
  dueDate?: Date;
  createdBy: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  taskType?: string;
  priority?: string;
  assignedTo?: number;
  status?: string;
  dueDate?: Date;
  completedAt?: Date;
}

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters?: {
    status?: string;
    assignee?: number;
    createdBy?: number;
    taskType?: string;
    page?: number;
    pageSize?: number;
  }) {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.assignee) {
      where.assignedTo = filters.assignee;
    }
    if (filters?.createdBy) {
      where.createdBy = filters.createdBy;
    }
    if (filters?.taskType) {
      where.taskType = filters.taskType;
    }

    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        include: {
          assignee: {
            select: {
              id: true,
              username: true,
              displayName: true,
              role: true,
            },
          },
          creator: {
            select: {
              id: true,
              username: true,
              displayName: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      tasks,
      total,
      page,
      pageSize,
    };
  }

  async findById(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: {
            id: true,
            username: true,
            displayName: true,
            role: true,
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            role: true,
          },
        },
        history: {
          include: {
            user: {
              select: {
                username: true,
                displayName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    return task;
  }

  async create(data: CreateTaskDto) {
    const task = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        taskType: data.taskType,
        priority: data.priority || 'medium',
        assignedTo: data.assignedTo,
        createdBy: data.createdBy,
        dueDate: data.dueDate,
        status: 'pending',
      },
      include: {
        assignee: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });

    // Update user's current task count if assigned
    if (data.assignedTo) {
      await this.prisma.user.update({
        where: { id: data.assignedTo },
        data: {
          currentTasks: { increment: 1 },
        },
      });
    }

    // Create history record
    await this.prisma.taskHistory.create({
      data: {
        taskId: task.id,
        userId: data.createdBy,
        action: 'created',
        newValue: task.status,
      },
    });

    return task;
  }

  async update(id: number, data: UpdateTaskDto, userId: number, userRole: string) {
    const task = await this.findById(id);
    
    // Check permissions: only creator, assignee, or manager can update
    if (
      userRole !== 'manager' &&
      task.createdBy !== userId &&
      task.assignedTo !== userId
    ) {
      throw new ForbiddenException('You do not have permission to update this task');
    }

    // Handle status change
    if (data.status && data.status !== task.status) {
      await this.prisma.taskHistory.create({
        data: {
          taskId: id,
          userId,
          action: 'status_changed',
          oldValue: task.status,
          newValue: data.status,
        },
      });

      // Update completedAt if status is completed
      if (data.status === 'completed') {
        (data as any).completedAt = new Date();
      }
    }

    // Handle assignment change
    if (data.assignedTo !== undefined && data.assignedTo !== task.assignedTo) {
      // Decrement old assignee's task count
      if (task.assignedTo) {
        await this.prisma.user.update({
          where: { id: task.assignedTo },
          data: { currentTasks: { decrement: 1 } },
        });
      }
      // Increment new assignee's task count
      if (data.assignedTo) {
        await this.prisma.user.update({
          where: { id: data.assignedTo },
          data: { currentTasks: { increment: 1 } },
        });
      }

      await this.prisma.taskHistory.create({
        data: {
          taskId: id,
          userId,
          action: 'assigned',
          oldValue: task.assignedTo?.toString(),
          newValue: data.assignedTo?.toString(),
        },
      });
    }

    return this.prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });
  }

  async delete(id: number, userId: number, userRole: string) {
    const task = await this.findById(id);
    
    // Only manager or creator can delete
    if (userRole !== 'manager' && task.createdBy !== userId) {
      throw new ForbiddenException('You do not have permission to delete this task');
    }

    // Decrement assignee's task count if assigned
    if (task.assignedTo) {
      await this.prisma.user.update({
        where: { id: task.assignedTo },
        data: { currentTasks: { decrement: 1 } },
      });
    }

    return this.prisma.task.delete({
      where: { id },
    });
  }

  async claimTask(taskId: number, userId: number) {
    const task = await this.findById(taskId);
    
    if (task.assignedTo) {
      throw new ForbiddenException('Task is already assigned');
    }

    return this.update(taskId, { assignedTo: userId }, userId, 'agent');
  }

  async updateStatus(taskId: number, status: string, userId: number) {
    const task = await this.findById(taskId);
    
    // Only assignee or manager can update status
    if (task.assignedTo !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'manager') {
        throw new ForbiddenException('You do not have permission to update this task status');
      }
    }

    return this.update(taskId, { status }, userId, 'any');
  }
}
