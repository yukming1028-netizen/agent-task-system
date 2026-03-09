import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TasksService', () => {
  let tasksService: TasksService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    task: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    user: {
      update: jest.fn(),
      findUnique: jest.fn(),
    },
    taskHistory: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    tasksService = module.get<TasksService>(TasksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated tasks with filters', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'pending', assignedTo: 1 },
        { id: 2, title: 'Task 2', status: 'in_progress', assignedTo: 2 },
      ];

      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaService.task.count.mockResolvedValue(2);

      const result = await tasksService.findAll({
        status: 'pending',
        assignee: 1,
        page: 1,
        pageSize: 10,
      });

      expect(result).toEqual({
        tasks: mockTasks,
        total: 2,
        page: 1,
        pageSize: 10,
      });
    });

    it('should return all tasks without filters', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'pending' },
        { id: 2, title: 'Task 2', status: 'completed' },
      ];

      mockPrismaService.task.findMany.mockResolvedValue(mockTasks);
      mockPrismaService.task.count.mockResolvedValue(2);

      const result = await tasksService.findAll();

      expect(result.tasks).toHaveLength(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });
  });

  describe('findById', () => {
    it('should return task by id', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'pending',
        taskType: 'design',
      };

      mockPrismaService.task.findUnique.mockResolvedValue(mockTask);

      const result = await tasksService.findById(1);

      expect(result).toEqual(mockTask);
      expect(mockPrismaService.task.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if task not found', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(null);

      await expect(tasksService.findById(999))
        .rejects.toThrow(NotFoundException);
      await expect(tasksService.findById(999))
        .rejects.toThrow('Task with id 999 not found');
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createData = {
        title: 'New Task',
        description: 'Task Description',
        taskType: 'design',
        priority: 'high',
        assignedTo: 2,
        createdBy: 1,
        dueDate: new Date('2026-03-20'),
      };

      const mockCreatedTask = {
        id: 101,
        ...createData,
        status: 'pending',
        createdAt: new Date(),
      };

      mockPrismaService.task.create.mockResolvedValue(mockCreatedTask);
      mockPrismaService.user.update.mockResolvedValue({});
      mockPrismaService.taskHistory.create.mockResolvedValue({});

      const result = await tasksService.create(createData);

      expect(result).toEqual(mockCreatedTask);
      expect(mockPrismaService.task.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'New Task',
          status: 'pending',
          assignedTo: 2,
        }),
        include: expect.any(Object),
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { currentTasks: { increment: 1 } },
      });
      expect(mockPrismaService.taskHistory.create).toHaveBeenCalled();
    });

    it('should create task without assignment', async () => {
      const createData = {
        title: 'Unassigned Task',
        description: 'Task Description',
        taskType: 'development',
        createdBy: 1,
      };

      const mockCreatedTask = {
        id: 102,
        ...createData,
        status: 'pending',
        assignedTo: null,
      };

      mockPrismaService.task.create.mockResolvedValue(mockCreatedTask);

      const result = await tasksService.create(createData);

      expect(result).toEqual(mockCreatedTask);
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const existingTask = {
      id: 1,
      title: 'Existing Task',
      status: 'pending',
      assignedTo: 2,
      createdBy: 1,
    };

    beforeEach(() => {
      mockPrismaService.task.findUnique.mockResolvedValue(existingTask);
    });

    it('should update task as manager', async () => {
      const updateData = { status: 'in_progress' };
      const updatedTask = { ...existingTask, ...updateData };

      mockPrismaService.task.update.mockResolvedValue(updatedTask);
      mockPrismaService.taskHistory.create.mockResolvedValue({});

      const result = await tasksService.update(1, updateData, 1, 'manager');

      expect(result).toEqual(updatedTask);
      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({ status: 'in_progress' }),
        include: expect.any(Object),
      });
    });

    it('should update task as creator', async () => {
      const updateData = { title: 'Updated Title' };
      const updatedTask = { ...existingTask, ...updateData };

      mockPrismaService.task.update.mockResolvedValue(updatedTask);

      const result = await tasksService.update(1, updateData, 1, 'developer');

      expect(result).toEqual(updatedTask);
    });

    it('should update task as assignee', async () => {
      const updateData = { status: 'completed' };
      const updatedTask = { ...existingTask, ...updateData };

      mockPrismaService.task.update.mockResolvedValue(updatedTask);
      mockPrismaService.taskHistory.create.mockResolvedValue({});

      const result = await tasksService.update(1, updateData, 2, 'developer');

      expect(result).toEqual(updatedTask);
    });

    it('should throw ForbiddenException if user has no permission', async () => {
      const updateData = { status: 'completed' };

      await expect(tasksService.update(1, updateData, 999, 'developer'))
        .rejects.toThrow(ForbiddenException);
      await expect(tasksService.update(1, updateData, 999, 'developer'))
        .rejects.toThrow('You do not have permission to update this task');
    });

    it('should create history record on status change', async () => {
      const updateData = { status: 'completed' };
      const updatedTask = { ...existingTask, ...updateData };

      mockPrismaService.task.update.mockResolvedValue(updatedTask);
      mockPrismaService.taskHistory.create.mockResolvedValue({});

      await tasksService.update(1, updateData, 1, 'manager');

      expect(mockPrismaService.taskHistory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'status_changed',
          oldValue: 'pending',
          newValue: 'completed',
        }),
      });
    });

    it('should update task assignment and adjust user task counts', async () => {
      const updateData = { assignedTo: 3 };
      const updatedTask = { ...existingTask, assignedTo: 3 };

      mockPrismaService.task.update.mockResolvedValue(updatedTask);
      mockPrismaService.user.update.mockResolvedValue({});
      mockPrismaService.taskHistory.create.mockResolvedValue({});

      await tasksService.update(1, updateData, 1, 'manager');

      expect(mockPrismaService.user.update).toHaveBeenCalledTimes(2);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { currentTasks: { decrement: 1 } },
      });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: { currentTasks: { increment: 1 } },
      });
    });
  });

  describe('delete', () => {
    const existingTask = {
      id: 1,
      title: 'Task to Delete',
      status: 'pending',
      assignedTo: 2,
      createdBy: 1,
    };

    beforeEach(() => {
      mockPrismaService.task.findUnique.mockResolvedValue(existingTask);
      mockPrismaService.user.update.mockResolvedValue({});
    });

    it('should delete task as manager', async () => {
      mockPrismaService.task.delete.mockResolvedValue(existingTask);

      const result = await tasksService.delete(1, 1, 'manager');

      expect(result).toEqual(existingTask);
      expect(mockPrismaService.task.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should delete task as creator', async () => {
      mockPrismaService.task.delete.mockResolvedValue(existingTask);

      const result = await tasksService.delete(1, 1, 'developer');

      expect(result).toEqual(existingTask);
    });

    it('should throw ForbiddenException if user has no permission', async () => {
      await expect(tasksService.delete(1, 999, 'developer'))
        .rejects.toThrow(ForbiddenException);
    });

    it('should decrement assignee task count when deleting assigned task', async () => {
      mockPrismaService.task.delete.mockResolvedValue(existingTask);

      await tasksService.delete(1, 1, 'manager');

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { currentTasks: { decrement: 1 } },
      });
    });
  });

  describe('claimTask', () => {
    const unassignedTask = {
      id: 1,
      title: 'Available Task',
      status: 'pending',
      assignedTo: null,
      createdBy: 1,
    };

    const assignedTask = {
      id: 2,
      title: 'Taken Task',
      status: 'pending',
      assignedTo: 1,
      createdBy: 1,
    };

    beforeEach(() => {
      mockPrismaService.task.update.mockResolvedValue({});
      mockPrismaService.taskHistory.create.mockResolvedValue({});
      mockPrismaService.user.update.mockResolvedValue({});
    });

    it('should claim unassigned task', async () => {
      // findById is called first, which uses findUnique
      mockPrismaService.task.findUnique.mockResolvedValueOnce(unassignedTask);
      // Then update is called which also calls findById (findUnique again)
      mockPrismaService.task.findUnique.mockResolvedValueOnce({ ...unassignedTask, assignedTo: 5 });
      mockPrismaService.task.update.mockResolvedValue({
        ...unassignedTask,
        assignedTo: 5,
      });

      const result = await tasksService.claimTask(1, 5);

      expect(result.assignedTo).toBe(5);
    });

    it('should throw ForbiddenException if task is already assigned', async () => {
      mockPrismaService.task.findUnique.mockResolvedValueOnce(assignedTask);

      await expect(tasksService.claimTask(2, 5))
        .rejects.toThrow(ForbiddenException);
      await expect(tasksService.claimTask(2, 5))
        .rejects.toThrow('Task is already assigned');
    });
  });

  describe('updateStatus', () => {
    const task = {
      id: 1,
      title: 'Task',
      status: 'pending',
      assignedTo: 2,
      createdBy: 1,
    };

    beforeEach(() => {
      mockPrismaService.task.update.mockResolvedValue({});
      mockPrismaService.taskHistory.create.mockResolvedValue({});
      mockPrismaService.user.update.mockResolvedValue({});
    });

    it('should update status as assignee', async () => {
      mockPrismaService.task.findUnique.mockResolvedValue(task);
      mockPrismaService.task.findUnique.mockResolvedValue({ ...task, status: 'in_progress' });

      await tasksService.updateStatus(1, 'in_progress', 2);

      expect(mockPrismaService.task.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({ status: 'in_progress' }),
        include: expect.any(Object),
      });
    });

    it('should update status as manager', async () => {
      const managerUser = { id: 1, role: 'manager' };
      mockPrismaService.task.findUnique.mockResolvedValue(task);
      mockPrismaService.task.findUnique.mockResolvedValue({ ...task, status: 'completed' });
      mockPrismaService.user.findUnique.mockResolvedValue(managerUser);

      await tasksService.updateStatus(1, 'completed', 1);

      expect(mockPrismaService.task.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if not assignee or manager', async () => {
      const otherUser = { id: 999, role: 'developer' };
      mockPrismaService.task.findUnique.mockResolvedValue(task);
      mockPrismaService.user.findUnique.mockResolvedValue(otherUser);

      await expect(tasksService.updateStatus(1, 'completed', 999))
        .rejects.toThrow(ForbiddenException);
    });
  });
});
