import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';

describe('UsersService', () => {
  let usersService: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: 1,
        username: 'manager1',
        email: 'manager1@test.com',
        role: 'manager',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await usersService.findById(1);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await usersService.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return user by username', async () => {
      const mockUser = {
        id: 1,
        username: 'manager1',
        email: 'manager1@test.com',
        role: 'manager',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await usersService.findByUsername('manager1');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'manager1' },
      });
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const mockUser = {
        id: 1,
        username: 'manager1',
        email: 'manager1@test.com',
        role: 'manager',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await usersService.findByEmail('manager1@test.com');

      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users without password', async () => {
      const mockUsers = [
        {
          id: 1,
          username: 'manager1',
          email: 'manager1@test.com',
          role: 'manager',
          displayName: 'Manager One',
          isAvailable: true,
          currentTasks: 2,
        },
        {
          id: 2,
          username: 'developer1',
          email: 'developer1@test.com',
          role: 'developer',
          displayName: 'Developer One',
          isAvailable: true,
          currentTasks: 1,
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      const result = await usersService.findAll();

      expect(result).toEqual(mockUsers);
      expect(result[0]).not.toHaveProperty('passwordHash');
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createData = {
        username: 'newuser',
        email: 'newuser@test.com',
        passwordHash: 'hashed-password',
        role: 'developer',
        displayName: 'New User',
      };

      const mockCreatedUser = { id: 6, ...createData };

      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      const result = await usersService.create(createData);

      expect(result).toEqual(mockCreatedUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: createData,
      });
    });
  });

  describe('update', () => {
    it('should update existing user', async () => {
      const existingUser = {
        id: 1,
        username: 'manager1',
        email: 'manager1@test.com',
        role: 'manager',
      };

      const updateData = { displayName: 'Updated Name' };
      const updatedUser = { ...existingUser, ...updateData };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await usersService.update(1, updateData);

      expect(result).toEqual(updatedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(usersService.update(999, { displayName: 'Test' }))
        .rejects.toThrow(NotFoundException);
      await expect(usersService.update(999, { displayName: 'Test' }))
        .rejects.toThrow('User with id 999 not found');
    });
  });

  describe('updateAvailability', () => {
    it('should update user availability', async () => {
      const mockUser = {
        id: 1,
        username: 'developer1',
        isAvailable: false,
      };

      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await usersService.updateAvailability(1, false);

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isAvailable: false },
      });
    });
  });

  describe('getAvailableAgents', () => {
    it('should return all available agents', async () => {
      const mockAgents = [
        {
          id: 2,
          username: 'developer1',
          displayName: 'Developer One',
          role: 'developer',
          currentTasks: 1,
        },
        {
          id: 3,
          username: 'developer2',
          displayName: 'Developer Two',
          role: 'developer',
          currentTasks: 0,
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockAgents);

      const result = await usersService.getAvailableAgents();

      expect(result).toEqual(mockAgents);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          isAvailable: true,
          currentTasks: { lt: 5 },
        },
        select: expect.any(Object),
      });
    });

    it('should filter available agents by role', async () => {
      const mockAgents = [
        {
          id: 2,
          username: 'developer1',
          displayName: 'Developer One',
          role: 'developer',
          currentTasks: 1,
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockAgents);

      const result = await usersService.getAvailableAgents('developer');

      expect(result).toEqual(mockAgents);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          isAvailable: true,
          currentTasks: { lt: 5 },
          role: 'developer',
        },
        select: expect.any(Object),
      });
    });
  });
});
