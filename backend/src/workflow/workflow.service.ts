import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) {}

  async designToDev(designTaskId: number, userId: number) {
    // Get the design task
    const designTask = await this.prisma.task.findUnique({
      where: { id: designTaskId },
    });

    if (!designTask) {
      throw new NotFoundException('Design task not found');
    }

    if (designTask.taskType !== 'design') {
      throw new Error('This is not a design task');
    }

    // Update design task status
    await this.prisma.task.update({
      where: { id: designTaskId },
      data: { status: 'completed', completedAt: new Date() },
    });

    // Create development task as child
    const devTask = await this.prisma.task.create({
      data: {
        title: `Dev: ${designTask.title}`,
        description: `Development task based on design: ${designTask.description}`,
        taskType: 'development',
        priority: designTask.priority,
        status: 'pending',
        createdBy: userId,
        parentTaskId: designTaskId,
        dueDate: designTask.dueDate,
      },
    });

    // Create history
    await this.prisma.taskHistory.create({
      data: {
        taskId: devTask.id,
        userId,
        action: 'created',
        newValue: 'pending',
        comment: 'Auto-created from design task completion',
      },
    });

    return devTask;
  }

  async devToQa(devTaskId: number, userId: number) {
    // Get the development task
    const devTask = await this.prisma.task.findUnique({
      where: { id: devTaskId },
    });

    if (!devTask) {
      throw new NotFoundException('Development task not found');
    }

    if (devTask.taskType !== 'development') {
      throw new Error('This is not a development task');
    }

    // Update dev task status
    await this.prisma.task.update({
      where: { id: devTaskId },
      data: { status: 'completed', completedAt: new Date() },
    });

    // Create QA task as child
    const qaTask = await this.prisma.task.create({
      data: {
        title: `QA: ${devTask.title}`,
        description: `QA testing task based on development: ${devTask.description}`,
        taskType: 'qa',
        priority: devTask.priority,
        status: 'pending',
        createdBy: userId,
        parentTaskId: devTaskId,
        dueDate: devTask.dueDate,
      },
    });

    // Create history
    await this.prisma.taskHistory.create({
      data: {
        taskId: qaTask.id,
        userId,
        action: 'created',
        newValue: 'pending',
        comment: 'Auto-created from development task completion',
      },
    });

    return qaTask;
  }

  async getPendingAssignments() {
    const pendingTasks = await this.prisma.task.findMany({
      where: {
        status: 'pending',
        assignedTo: null,
      },
      include: {
        creator: {
          select: { id: true, username: true, displayName: true },
        },
      },
      orderBy: {
        priority: 'desc',
      },
    });

    return pendingTasks;
  }

  async getAvailableDevelopers() {
    const developers = await this.prisma.user.findMany({
      where: {
        role: 'developer',
        isAvailable: true,
      },
      include: {
        agentStatus: true,
      },
    });

    return developers.filter((dev) => dev.currentTasks < dev.maxTasks);
  }
}
