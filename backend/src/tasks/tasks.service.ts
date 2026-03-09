import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: number) {
    const task = await this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        taskType: createTaskDto.taskType,
        priority: createTaskDto.priority || 'medium',
        status: 'pending',
        createdBy: userId,
        assignedTo: createTaskDto.assignedTo,
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
      },
      include: {
        creator: {
          select: { id: true, username: true, displayName: true },
        },
        assignee: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });

    // Create task history
    await this.prisma.taskHistory.create({
      data: {
        taskId: task.id,
        userId,
        action: 'created',
        newValue: task.status,
      },
    });

    return task;
  }

  async findAll(filters: {
    status?: string;
    taskType?: string;
    assignee?: number;
    createdBy?: number;
    page?: number;
    pageSize?: number;
  }) {
    const { page = 1, pageSize = 20, ...where } = filters;
    const skip = (page - 1) * pageSize;

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where: where as any,
        include: {
          creator: {
            select: { id: true, username: true, displayName: true },
          },
          assignee: {
            select: { id: true, username: true, displayName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.task.count({ where: where as any }),
    ]);

    return {
      tasks,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, username: true, displayName: true, role: true },
        },
        assignee: {
          select: { id: true, username: true, displayName: true, role: true },
        },
        taskHistories: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        attachments: true,
        comments: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
    const task = await this.findOne(id);

    // Check permission
    if (task.assignedTo !== userId && task.createdBy !== userId) {
      throw new ForbiddenException('You can only update tasks assigned to you or created by you');
    }

    const updateData: any = { ...updateTaskDto };
    if (updateTaskDto.dueDate) {
      updateData.dueDate = new Date(updateTaskDto.dueDate);
    }

    // Track status change in history
    if (updateTaskDto.status && updateTaskDto.status !== task.status) {
      await this.prisma.taskHistory.create({
        data: {
          taskId: id,
          userId,
          action: 'status_changed',
          oldValue: task.status,
          newValue: updateTaskDto.status,
        },
      });

      if (updateTaskDto.status === 'completed') {
        updateData.completedAt = new Date();
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: { id: true, username: true, displayName: true },
        },
        assignee: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });
  }

  async remove(id: number, userId: number) {
    const task = await this.findOne(id);

    // Only creator can delete
    if (task.createdBy !== userId) {
      throw new ForbiddenException('Only the task creator can delete the task');
    }

    await this.prisma.task.delete({
      where: { id },
    });

    return { success: true, message: 'Task deleted successfully' };
  }

  async claimTask(taskId: number, userId: number) {
    const task = await this.findOne(taskId);

    if (task.status !== 'pending') {
      throw new ForbiddenException('Only pending tasks can be claimed');
    }

    // Check user's current task load
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.currentTasks >= user.maxTasks) {
      throw new ForbiddenException('You have reached your maximum task limit');
    }

    // Update task
    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        assignedTo: userId,
        status: 'in_progress',
      },
      include: {
        creator: {
          select: { id: true, username: true, displayName: true },
        },
        assignee: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });

    // Update user's task count
    await this.prisma.user.update({
      where: { id: userId },
      data: { currentTasks: { increment: 1 } },
    });

    // Update agent status
    await this.prisma.agentStatus.update({
      where: { userId },
      data: {
        currentTaskCount: { increment: 1 },
        status: 'busy',
        lastActive: new Date(),
      },
    });

    // Create history
    await this.prisma.taskHistory.create({
      data: {
        taskId,
        userId,
        action: 'assigned',
        newValue: 'in_progress',
        comment: 'Task claimed by user',
      },
    });

    return updatedTask;
  }

  async submitForReview(taskId: number, userId: number) {
    const task = await this.findOne(taskId);

    if (task.assignedTo !== userId) {
      throw new ForbiddenException('You can only submit tasks assigned to you');
    }

    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'review',
      },
      include: {
        creator: {
          select: { id: true, username: true, displayName: true },
        },
        assignee: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });

    await this.prisma.taskHistory.create({
      data: {
        taskId,
        userId,
        action: 'status_changed',
        oldValue: 'in_progress',
        newValue: 'review',
        comment: 'Submitted for review',
      },
    });

    return updatedTask;
  }

  async completeTask(taskId: number, userId: number) {
    const task = await this.findOne(taskId);

    if (task.assignedTo !== userId) {
      throw new ForbiddenException('You can only complete tasks assigned to you');
    }

    // Update task to completed
    const updatedTask = await this.prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
      include: {
        creator: {
          select: { id: true, username: true, displayName: true },
        },
        assignee: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });

    // Update user's task count
    await this.prisma.user.update({
      where: { id: userId },
      data: { currentTasks: { decrement: 1 } },
    });

    // Update agent status
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const newTaskCount = Math.max(0, user.currentTasks - 1);
    await this.prisma.agentStatus.update({
      where: { userId },
      data: {
        currentTaskCount: newTaskCount,
        status: newTaskCount < user.maxTasks ? 'available' : 'busy',
        lastActive: new Date(),
      },
    });

    // Create history
    await this.prisma.taskHistory.create({
      data: {
        taskId,
        userId,
        action: 'completed',
        newValue: 'completed',
        comment: 'Task completed',
      },
    });

    // Auto-trigger workflow based on task type
    let nextTask = null;
    if (task.taskType === 'design') {
      // Design completed → Create development task
      nextTask = await this.createChildTask(taskId, 'development', userId);
    } else if (task.taskType === 'development') {
      // Development completed → Create QA task
      nextTask = await this.createChildTask(taskId, 'qa', userId);
    }

    return {
      task: updatedTask,
      nextTask,
    };
  }

  private async createChildTask(parentTaskId: number, taskType: string, userId: number) {
    const parentTask = await this.prisma.task.findUnique({
      where: { id: parentTaskId },
    });

    if (!parentTask) {
      return null;
    }

    const taskTypeTitles: any = {
      development: 'Dev',
      qa: 'QA',
    };

    // Find available assignee based on task type
    const roleForTaskType: any = {
      development: 'developer',
      qa: 'qa',
    };

    // Find available user with least tasks
    const availableUsers = await this.prisma.user.findMany({
      where: {
        role: roleForTaskType[taskType],
        isAvailable: true,
        currentTasks: { lt: 5 }, // maxTasks
      },
      orderBy: {
        currentTasks: 'asc',
      },
      take: 1,
    });

    const assignedTo = availableUsers.length > 0 ? availableUsers[0].id : null;

    const childTask = await this.prisma.task.create({
      data: {
        title: `${taskTypeTitles[taskType]}: ${parentTask.title}`,
        description: `Auto-created from ${parentTask.taskType} task: ${parentTask.description}`,
        taskType,
        priority: parentTask.priority,
        status: assignedTo ? 'in_progress' : 'pending',
        createdBy: userId,
        assignedTo,
        parentTaskId,
        dueDate: parentTask.dueDate,
      },
      include: {
        creator: {
          select: { id: true, username: true, displayName: true },
        },
        assignee: {
          select: { id: true, username: true, displayName: true },
        },
      },
    });

    // If assigned, update assignee's task count
    if (assignedTo) {
      await this.prisma.user.update({
        where: { id: assignedTo },
        data: { currentTasks: { increment: 1 } },
      });

      await this.prisma.agentStatus.update({
        where: { userId: assignedTo },
        data: {
          currentTaskCount: { increment: 1 },
          status: 'busy',
          lastActive: new Date(),
        },
      });
    }

    // Create history
    await this.prisma.taskHistory.create({
      data: {
        taskId: childTask.id,
        userId,
        action: 'created',
        newValue: childTask.status,
        comment: `Auto-created from ${parentTask.taskType} completion`,
      },
    });

    return childTask;
  }
}
