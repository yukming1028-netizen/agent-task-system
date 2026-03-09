import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('DashboardController', () => {
  let dashboardController: DashboardController;
  let dashboardService: DashboardService;

  const mockDashboardService = {
    getSummary: jest.fn(),
    getStats: jest.fn(),
    getAgents: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    dashboardController = module.get<DashboardController>(DashboardController);
    dashboardService = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSummary', () => {
    it('should return dashboard summary', async () => {
      const mockRequest = { user: { userId: 1, role: 'manager' } };
      const mockSummary = {
        stats: { total: 10, pending: 3, inProgress: 4, completed: 3 },
        recentTasks: [],
        agentStatus: [],
      };

      mockDashboardService.getSummary.mockResolvedValue(mockSummary);

      const result = await dashboardController.getSummary(mockRequest as any);

      expect(result).toEqual(mockSummary);
      expect(mockDashboardService.getSummary).toHaveBeenCalledWith(1, 'manager');
    });
  });

  describe('getStats', () => {
    it('should return dashboard statistics', async () => {
      const mockRequest = { user: { userId: 2, role: 'developer' } };
      const mockStats = {
        total: 5,
        byStatus: { pending: 2, inProgress: 2, completed: 1 },
        byPriority: { low: 1, medium: 3, high: 1 },
        byType: { design: 2, development: 3 },
      };

      mockDashboardService.getStats.mockResolvedValue(mockStats);

      const result = await dashboardController.getStats(mockRequest as any);

      expect(result).toEqual(mockStats);
      expect(mockDashboardService.getStats).toHaveBeenCalledWith(2, 'developer');
    });
  });

  describe('getAgents', () => {
    it('should return all agents status', async () => {
      const mockAgents = [
        {
          id: 1,
          username: 'manager1',
          role: 'manager',
          status: 'available',
        },
        {
          id: 2,
          username: 'developer1',
          role: 'developer',
          status: 'busy',
        },
      ];

      mockDashboardService.getAgents.mockResolvedValue(mockAgents);

      const result = await dashboardController.getAgents();

      expect(result).toEqual(mockAgents);
      expect(mockDashboardService.getAgents).toHaveBeenCalled();
    });
  });
});
