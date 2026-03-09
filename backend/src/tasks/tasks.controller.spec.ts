import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('TasksController', () => {
  let tasksController: TasksController;
  let tasksService: TasksService;

  const mockTasksService = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    claimTask: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    tasksController = module.get<TasksController>(TasksController);
    tasksService = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return tasks for manager (created by)', async () => {
      const mockRequest = { user: { userId: 1, role: 'manager' } };
      const mockResponse = {
        tasks: [{ id: 1, title: 'Task 1' }],
        total: 1,
        page: 1,
        pageSize: 20,
      };

      mockTasksService.findAll.mockResolvedValue(mockResponse);

      const result = await tasksController.findAll(mockRequest as any);

      expect(result).toEqual(mockResponse);
      expect(mockTasksService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ createdBy: 1 }),
      );
    });

    it('should return tasks for agent (assigned to)', async () => {
      const mockRequest = { user: { userId: 2, role: 'developer' } };
      const mockResponse = {
        tasks: [{ id: 1, title: 'Task 1' }],
        total: 1,
        page: 1,
        pageSize: 20,
      };

      mockTasksService.findAll.mockResolvedValue(mockResponse);

      const result = await tasksController.findAll(mockRequest as any);

      expect(result).toEqual(mockResponse);
      expect(mockTasksService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ assignee: 2 }),
      );
    });

    it('should filter by status and taskType', async () => {
      const mockRequest = { user: { userId: 1, role: 'manager' } };
      const mockResponse = { tasks: [], total: 0, page: 1, pageSize: 20 };

      mockTasksService.findAll.mockResolvedValue(mockResponse);

      await tasksController.findAll(mockRequest as any, 'pending', undefined, 'design');

      expect(mockTasksService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'pending',
          taskType: 'design',
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return task by id', async () => {
      const mockTask = { id: 1, title: 'Task 1', status: 'pending' };

      mockTasksService.findById.mockResolvedValue(mockTask);

      const result = await tasksController.findById('1');

      expect(result).toEqual(mockTask);
      expect(mockTasksService.findById).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const mockRequest = { user: { userId: 1 } };
      const createDto = {
        title: 'New Task',
        description: 'Description',
        taskType: 'design',
        priority: 'high',
        assignedTo: 2,
      };
      const mockCreatedTask = { id: 101, ...createDto };

      mockTasksService.create.mockResolvedValue(mockCreatedTask);

      const result = await tasksController.create(mockRequest as any, createDto);

      expect(result).toEqual(mockCreatedTask);
      expect(mockTasksService.create).toHaveBeenCalledWith({
        ...createDto,
        createdBy: 1,
      });
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const mockRequest = { user: { userId: 1, role: 'manager' } };
      const updateDto = { status: 'in_progress' };
      const mockUpdatedTask = { id: 1, ...updateDto };

      mockTasksService.update.mockResolvedValue(mockUpdatedTask);

      const result = await tasksController.update('1', updateDto, mockRequest as any);

      expect(result).toEqual(mockUpdatedTask);
      expect(mockTasksService.update).toHaveBeenCalledWith(1, updateDto, 1, 'manager');
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      const mockRequest = { user: { userId: 1, role: 'manager' } };
      const mockDeletedTask = { id: 1, title: 'Deleted' };

      mockTasksService.delete.mockResolvedValue(mockDeletedTask);

      const result = await tasksController.delete('1', mockRequest as any);

      expect(result).toEqual(mockDeletedTask);
      expect(mockTasksService.delete).toHaveBeenCalledWith(1, 1, 'manager');
    });
  });

  describe('claimTask', () => {
    it('should claim a task', async () => {
      const mockRequest = { user: { userId: 2 } };
      const mockClaimedTask = { id: 1, assignedTo: 2 };

      mockTasksService.claimTask.mockResolvedValue(mockClaimedTask);

      const result = await tasksController.claimTask('1', mockRequest as any);

      expect(result).toEqual(mockClaimedTask);
      expect(mockTasksService.claimTask).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('updateStatus', () => {
    it('should update task status', async () => {
      const mockRequest = { user: { userId: 2 } };
      const mockUpdatedTask = { id: 1, status: 'completed' };

      mockTasksService.updateStatus.mockResolvedValue(mockUpdatedTask);

      const result = await tasksController.updateStatus('1', 'completed', mockRequest as any);

      expect(result).toEqual(mockUpdatedTask);
      expect(mockTasksService.updateStatus).toHaveBeenCalledWith(1, 'completed', 2);
    });
  });
});
