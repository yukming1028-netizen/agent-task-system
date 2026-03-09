import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByUsername: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without password if credentials are valid', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@test.com',
        role: 'developer',
        passwordHash: await bcrypt.hash('password123', 10),
      };

      mockUsersService.findByUsername.mockResolvedValue(mockUser);

      const result = await authService.validateUser('testuser', 'password123');

      expect(result).toEqual({
        id: 1,
        username: 'testuser',
        email: 'test@test.com',
        role: 'developer',
      });
      expect(mockUsersService.findByUsername).toHaveBeenCalledWith('testuser');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByUsername.mockResolvedValue(null);

      await expect(authService.validateUser('nonexistent', 'password123'))
        .rejects.toThrow(UnauthorizedException);
      await expect(authService.validateUser('nonexistent', 'password123'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@test.com',
        role: 'developer',
        passwordHash: await bcrypt.hash('password123', 10),
      };

      mockUsersService.findByUsername.mockResolvedValue(mockUser);

      await expect(authService.validateUser('testuser', 'wrongpassword'))
        .rejects.toThrow(UnauthorizedException);
      await expect(authService.validateUser('testuser', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('login', () => {
    it('should return access token and user info on successful login', async () => {
      const mockUser = {
        id: 1,
        username: 'manager1',
        email: 'manager1@test.com',
        role: 'manager',
        displayName: 'Manager One',
        passwordHash: await bcrypt.hash('password123', 10),
      };

      const mockToken = 'jwt-token-123';

      mockUsersService.findByUsername.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await authService.login('manager1', 'password123');

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: 1,
          username: 'manager1',
          email: 'manager1@test.com',
          role: 'manager',
          displayName: 'Manager One',
        },
      });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        userId: 1,
        username: 'manager1',
        role: 'manager',
      });
    });
  });

  describe('register', () => {
    it('should create new user and return token on successful registration', async () => {
      const mockNewUser = {
        id: 6,
        username: 'newuser',
        email: 'newuser@test.com',
        role: 'developer',
        displayName: 'New User',
        passwordHash: 'hashed-password',
      };

      const mockToken = 'jwt-token-new-user';

      mockUsersService.findByUsername.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockNewUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await authService.register(
        'newuser',
        'newuser@test.com',
        'password123',
        'developer',
      );

      expect(result).toEqual({
        access_token: mockToken,
        user: {
          id: 6,
          username: 'newuser',
          email: 'newuser@test.com',
          role: 'developer',
          displayName: 'New User',
        },
      });
      expect(mockUsersService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'newuser',
          email: 'newuser@test.com',
          role: 'developer',
        }),
      );
    });

    it('should throw ConflictException if username already exists', async () => {
      const existingUser = {
        id: 1,
        username: 'existinguser',
        email: 'existing@test.com',
        role: 'developer',
      };

      mockUsersService.findByUsername.mockResolvedValue(existingUser);

      await expect(
        authService.register('existinguser', 'new@test.com', 'password123', 'developer'),
      ).rejects.toThrow(ConflictException);
      await expect(
        authService.register('existinguser', 'new@test.com', 'password123', 'developer'),
      ).rejects.toThrow('Username already exists');
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      const mockUser = {
        id: 1,
        username: 'manager1',
        email: 'manager1@test.com',
        role: 'manager',
        displayName: 'Manager One',
        passwordHash: 'hashed-password',
      };

      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await authService.getProfile(1);

      expect(result).toEqual({
        id: 1,
        username: 'manager1',
        email: 'manager1@test.com',
        role: 'manager',
        displayName: 'Manager One',
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(authService.getProfile(999))
        .rejects.toThrow(UnauthorizedException);
      await expect(authService.getProfile(999))
        .rejects.toThrow('User not found');
    });
  });
});
