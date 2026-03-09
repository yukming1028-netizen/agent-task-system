import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user info from JWT payload', async () => {
      const payload = {
        userId: 1,
        username: 'manager1',
        role: 'manager',
        iat: 1234567890,
        exp: 1234567890,
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        userId: 1,
        username: 'manager1',
        role: 'manager',
      });
    });

    it('should exclude sensitive fields from payload', async () => {
      const payload = {
        userId: 1,
        username: 'developer1',
        role: 'developer',
        passwordHash: 'should-not-appear',
        iat: 1234567890,
      };

      const result = await strategy.validate(payload);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result).not.toHaveProperty('iat');
      expect(result).not.toHaveProperty('exp');
    });
  });
});
