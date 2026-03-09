import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    getProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return access token and user info', async () => {
      const loginDto = { username: 'manager1', password: 'password123' };
      const mockResponse = {
        access_token: 'jwt-token-123',
        user: {
          id: 1,
          username: 'manager1',
          email: 'manager1@test.com',
          role: 'manager',
          displayName: 'Manager One',
        },
      };

      mockAuthService.login.mockResolvedValue(mockResponse);

      const result = await authController.login(loginDto);

      expect(result).toEqual(mockResponse);
      expect(authService.login).toHaveBeenCalledWith('manager1', 'password123');
    });
  });

  describe('register', () => {
    it('should register new user and return token', async () => {
      const registerDto = {
        username: 'newuser',
        email: 'newuser@test.com',
        password: 'password123',
        role: 'developer',
      };
      const mockResponse = {
        access_token: 'jwt-token-new',
        user: {
          id: 6,
          username: 'newuser',
          email: 'newuser@test.com',
          role: 'developer',
          displayName: 'New User',
        },
      };

      mockAuthService.register.mockResolvedValue(mockResponse);

      const result = await authController.register(registerDto);

      expect(result).toEqual(mockResponse);
      expect(authService.register).toHaveBeenCalledWith(
        'newuser',
        'newuser@test.com',
        'password123',
        'developer',
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockRequest = { user: { userId: 1 } };
      const mockProfile = {
        id: 1,
        username: 'manager1',
        email: 'manager1@test.com',
        role: 'manager',
        displayName: 'Manager One',
      };

      mockAuthService.getProfile.mockResolvedValue(mockProfile);

      const result = await authController.getProfile(mockRequest as any);

      expect(result).toEqual(mockProfile);
      expect(authService.getProfile).toHaveBeenCalledWith(1);
    });
  });
});
