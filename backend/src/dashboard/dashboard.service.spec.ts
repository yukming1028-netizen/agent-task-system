import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { TasksService } from '../tasks/tasks.service';
import { UsersService } from '../users/users.service';

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let tasksService: TasksService;
  let usersService: UsersService;

  const mockTasksService = {
    findAll: jest.fn(),
  };

  const mockUsersService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    dashboardService = module.get<DashboardService>(DashboardService);
    tasksService = module.get<TasksService>(TasksService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('should return dashboard summary for manager', async () => {
      const mockTasks = {
        tasks: [
          { id: 1, title: 'Task 1', status: 'pending', priority: 'high' },
          { id: 2, title: 'Task 2', status: 'in_progress', priority: 'medium' },
          { id: 3, title: 'Task 3', status: 'completed', priority: 'low' },
          { id: 4, title: 'Task 4', status: 'review', priority: 'high' },
        ],
        total: 4,
        page: 1,
        pageSize: 1000,
      };

      const mockUsers = [
        {
          id: 2,
          username: 'designer1',
          displayName: 'Designer One',
          role: 'designer',
          isAvailable: true,
          currentTasks: 1,
        },
        {
          id: 3,
          username: 'developer1',
          displayName: 'Developer One',
          role: 'developer',
          isAvailable: true,
          currentTasks: 2,
        },
        {
          id: 4,
          username: 'qa1',
          displayName: 'QA One',
          role: 'qa',
          isAvailable: true,
          currentTasks: 0,
        },
      ];

      mockTasksService.findAll.mockResolvedValue(mockTasks);
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await dashboardService.getSummary(1, 'manager');

      expect(result.stats).toEqual({
        total: 4,
        pending: 1,
        inProgress: 1,
        completed: 1,
        review: 1,
      });
      expect(result.recentTasks).toHaveLength(4);
      expect(result.agentStatus).toHaveLength(3);
      expect(result.agentStatus[0]).toEqual({
        id: 2,
        username: 'designer1',
        displayName: 'Designer One',
        role: 'designer',
        isAvailable: true,
        currentTasks: 1,
        status: 'available',
      });
    });

    it('should return dashboard summary for agent (developer)', async () => {
      const mockTasks = {
        tasks: [
          { id: 1, title: 'My Task 1', status: 'in_progress' },
          { id: 2, title: 'My Task 2', status: 'pending' },
        ],
        total: 2,
        page: 1,
        pageSize: 1000,
      };

      const mockUsers = [
        {
          id: 1,
          username: 'manager1',
          displayName: 'Manager One',
          role: 'manager',
          isAvailable: true,
          currentTasks: 0,
        },
      ];

      mockTasksService.findAll.mockResolvedValue(mockTasks);
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await dashboardService.getSummary(3, 'developer');

      expect(result.stats.total).toBe(2);
      expect(result.stats.inProgress).toBe(1);
      expect(result.stats.pending).toBe(1);
      expect(mockTasksService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ assignee: 3 }),
      );
    });

    it('should limit recentTasks to 10 items', async () => {
      const manyTasks = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        title: `Task ${i + 1}`,
        status: 'pending',
      }));

      const mockTasks = {
        tasks: manyTasks,
        total: 15,
        page: 1,
        pageSize: 1000,
      };

      mockTasksService.findAll.mockResolvedValue(mockTasks);
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await dashboardService.getSummary(1, 'manager');

      expect(result.recentTasks).toHaveLength(10);
    });
  });

  describe('getStats', () => {
    it('should return detailed statistics', async () => {
      const mockTasks = {
        tasks: [
          { id: 1, status: 'pending', priority: 'low', taskType: 'design' },
          { id: 2, status: 'in_progress', priority: 'medium', taskType: 'development' },
          { id: 3, status: 'in_progress', priority: 'high', taskType: 'development' },
          { id: 4, status: 'completed', priority: 'urgent', taskType: 'qa' },
          { id: 5, status: 'completed', priority: 'medium', taskType: 'design' },
          { id: 6, status: 'cancelled', priority: 'low', taskType: 'development' },
          { id: 7, status: 'review', priority: 'high', taskType: 'qa' },
        ],
        total: 7,
      };

      mockTasksService.findAll.mockResolvedValue(mockTasks);

      const result = await dashboardService.getStats(1, 'manager');

      expect(result).toEqual({
        total: 7,
        byStatus: {
          pending: 1,
          inProgress: 2,
          completed: 2,
          review: 1,
          cancelled: 1,
        },
        byPriority: {
          low: 2,
          medium: 2,
          high: 2,
          urgent: 1,
        },
        byType: {
          design: 2,
          development: 3,
          qa: 2,
        },
      });
    });

    it('should filter tasks by user role', async () => {
      mockTasksService.findAll.mockResolvedValue({ tasks: [], total: 0 });

      await dashboardService.getStats(2, 'developer');

      expect(mockTasksService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ assignee: 2 }),
      );

      await dashboardService.getStats(1, 'manager');

      expect(mockTasksService.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ createdBy: 1 }),
      );
    });
  });

  describe('getAgents', () => {
    it('should return all agents with status', async () => {
      const mockUsers = [
        {
          id: 1,
          username: 'manager1',
          displayName: 'Manager One',
          role: 'manager',
          isAvailable: true,
          currentTasks: 0,
        },
        {
          id: 2,
          username: 'designer1',
          displayName: 'Designer One',
          role: 'designer',
          isAvailable: true,
          currentTasks: 3,
        },
        {
          id: 3,
          username: 'developer1',
          displayName: 'Developer One',
          role: 'developer',
          isAvailable: true,
          currentTasks: 5,
        },
        {
          id: 4,
          username: 'developer2',
          displayName: 'Developer Two',
          role: 'developer',
          isAvailable: false,
          currentTasks: 2,
        },
        {
          id: 5,
          username: 'qa1',
          displayName: 'QA One',
          role: 'qa',
          isAvailable: true,
          currentTasks: 1,
        },
      ];

      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await dashboardService.getAgents();

      expect(result).toHaveLength(5);
      expect(result[0]).toEqual({
        id: 1,
        username: 'manager1',
        displayName: 'Manager One',
        role: 'manager',
        isAvailable: true,
        currentTasks: 0,
        status: 'available',
      });
      expect(result[2]).toEqual({
        id: 3,
        username: 'developer1',
        displayName: 'Developer One',
        role: 'developer',
        isAvailable: true,
        currentTasks: 5,
        status: 'busy', // currentTasks >= 5
      });
      expect(result[3]).toEqual({
        id: 4,
        username: 'developer2',
        displayName: 'Developer Two',
        role: 'developer',
        isAvailable: false,
        currentTasks: 2,
        status: 'busy', // not available
      });
    });
  });
});
