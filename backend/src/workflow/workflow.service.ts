import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from '../tasks/tasks.service';

export interface WorkflowTransitionResult {
  success: boolean;
  newTask?: any;
  message: string;
}

@Injectable()
export class WorkflowService {
  constructor(
    private prisma: PrismaService,
    private tasksService: TasksService,
  ) {}

  /**
   * 設計完成 → 自動創建開發任務
   */
  async designToDev(designTaskId: number, userId: number): Promise<WorkflowTransitionResult> {
    // 驗證設計任務
    const designTask = await this.prisma.task.findUnique({
      where: { id: designTaskId },
      include: {
        creator: true,
        assignee: true,
      },
    });

    if (!designTask) {
      throw new NotFoundException('Design task not found');
    }

    // 驗證權限：只有設計任務的執行者或 Manager 可以觸發交接
    if (designTask.assignedTo !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'manager') {
        throw new ForbiddenException('Only designer or manager can trigger design-to-dev transition');
      }
    }

    // 驗證任務類型和狀態
    if (designTask.taskType !== 'design') {
      throw new ForbiddenException('Task is not a design task');
    }

    // 查找空閒的開發者 (優先找 Developer，然後是 Developer2)
    const availableDevelopers = await this.prisma.user.findFirst({
      where: {
        role: { in: ['developer'] },
        isAvailable: true,
        currentTasks: { lt: 5 },
      },
      orderBy: {
        currentTasks: 'asc',
      },
    });

    // 更新設計任務狀態為 completed
    await this.prisma.task.update({
      where: { id: designTaskId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // 創建開發任務
    const devTask = await this.prisma.task.create({
      data: {
        title: `Dev: ${designTask.title}`,
        description: `開發任務 - 基於設計任務 #${designTaskId}\n\n原始設計描述:\n${designTask.description || ''}`,
        taskType: 'development',
        priority: designTask.priority,
        status: 'pending',
        createdBy: userId,
        assignedTo: availableDevelopers?.id || null,
        parentTaskId: designTaskId,
        dueDate: designTask.dueDate,
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

    // 如果有分配開發者，更新其任務計數
    if (availableDevelopers?.id) {
      await this.prisma.user.update({
        where: { id: availableDevelopers.id },
        data: {
          currentTasks: { increment: 1 },
        },
      });
    }

    // 記錄工作流歷史
    await this.prisma.taskHistory.create({
      data: {
        taskId: designTaskId,
        userId,
        action: 'workflow_transition',
        oldValue: 'design',
        newValue: 'development',
        comment: `Design completed, dev task #${devTask.id} created`,
      },
    });

    await this.prisma.taskHistory.create({
      data: {
        taskId: devTask.id,
        userId,
        action: 'workflow_created',
        newValue: 'development',
        comment: `Auto-created from design task #${designTaskId}`,
      },
    });

    return {
      success: true,
      newTask: devTask,
      message: availableDevelopers
        ? `Design completed. Dev task created and assigned to ${availableDevelopers.displayName || availableDevelopers.username}`
        : 'Design completed. Dev task created (waiting for assignment)',
    };
  }

  /**
   * 開發完成 → 自動創建 QA 任務
   */
  async devToQa(devTaskId: number, userId: number): Promise<WorkflowTransitionResult> {
    // 驗證開發任務
    const devTask = await this.prisma.task.findUnique({
      where: { id: devTaskId },
      include: {
        creator: true,
        assignee: true,
      },
    });

    if (!devTask) {
      throw new NotFoundException('Development task not found');
    }

    // 驗證權限：只有開發任務的執行者或 Manager 可以觸發交接
    if (devTask.assignedTo !== userId) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.role !== 'manager') {
        throw new ForbiddenException('Only developer or manager can trigger dev-to-qa transition');
      }
    }

    // 驗證任務類型和狀態
    if (devTask.taskType !== 'development') {
      throw new ForbiddenException('Task is not a development task');
    }

    // 查找空閒的 QA
    const availableQA = await this.prisma.user.findFirst({
      where: {
        role: 'qa',
        isAvailable: true,
        currentTasks: { lt: 5 },
      },
      orderBy: {
        currentTasks: 'asc',
      },
    });

    // 更新開發任務狀態為 completed
    await this.prisma.task.update({
      where: { id: devTaskId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // 創建 QA 任務
    const qaTask = await this.prisma.task.create({
      data: {
        title: `QA: ${devTask.title}`,
        description: `QA 測試任務 - 基於開發任務 #${devTaskId}\n\n開發描述:\n${devTask.description || ''}`,
        taskType: 'qa',
        priority: devTask.priority,
        status: 'pending',
        createdBy: userId,
        assignedTo: availableQA?.id || null,
        parentTaskId: devTaskId,
        dueDate: devTask.dueDate,
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

    // 如果有分配 QA，更新其任務計數
    if (availableQA?.id) {
      await this.prisma.user.update({
        where: { id: availableQA.id },
        data: {
          currentTasks: { increment: 1 },
        },
      });
    }

    // 記錄工作流歷史
    await this.prisma.taskHistory.create({
      data: {
        taskId: devTaskId,
        userId,
        action: 'workflow_transition',
        oldValue: 'development',
        newValue: 'qa',
        comment: `Development completed, QA task #${qaTask.id} created`,
      },
    });

    await this.prisma.taskHistory.create({
      data: {
        taskId: qaTask.id,
        userId,
        action: 'workflow_created',
        newValue: 'qa',
        comment: `Auto-created from development task #${devTaskId}`,
      },
    });

    return {
      success: true,
      newTask: qaTask,
      message: availableQA
        ? `Development completed. QA task created and assigned to ${availableQA.displayName || availableQA.username}`
        : 'Development completed. QA task created (waiting for assignment)',
    };
  }

  /**
   * 獲取待分配任務 (等待 Agent 領取的任務)
   */
  async getPendingAssignments(role?: string) {
    const where: any = {
      assignedTo: null,
      status: 'pending',
    };

    if (role) {
      where.taskType = role === 'developer' ? 'development' : role;
    }

    return this.prisma.task.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * 獲取用戶的任務歷史
   */
  async getUserTaskHistory(userId: number, limit: number = 50) {
    return this.prisma.taskHistory.findMany({
      where: { userId },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            taskType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * 獲取任務的完整歷史鏈 (包括父任務)
   */
  async getTaskWorkflowChain(taskId: number) {
    const tasks = [];
    let currentTaskId = taskId;

    while (currentTaskId) {
      const task = await this.prisma.task.findUnique({
        where: { id: currentTaskId },
        include: {
          assignee: {
            select: {
              id: true,
              username: true,
              displayName: true,
              role: true,
            },
          },
          history: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!task) break;

      tasks.unshift(task);

      if (task.parentTaskId) {
        currentTaskId = task.parentTaskId;
      } else {
        break;
      }
    }

    return tasks;
  }
}
