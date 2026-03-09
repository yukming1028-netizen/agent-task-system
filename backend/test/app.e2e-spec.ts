import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

// Mock Prisma for e2e tests
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  task: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  taskHistory: {
    create: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
};

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('PrismaService')
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    jwtService = app.get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/api/auth/login (POST)', () => {
    it('should return access token on successful login', async () => {
      const mockUser = {
        id: 1,
        username: 'manager1',
        email: 'manager1@test.com',
        role: 'manager',
        displayName: 'Manager One',
        passwordHash: await bcrypt.hash('password123', 10),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'manager1', password: 'password123' })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id', 1);
      expect(response.body.user).toHaveProperty('username', 'manager1');
      expect(response.body.user).not.toHaveProperty('passwordHash');
    });

    it('should return 401 on invalid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username: 'invalid', password: 'wrongpassword' })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('/api/auth/register (POST)', () => {
    it('should register new user successfully', async () => {
      const mockNewUser = {
        id: 6,
        username: 'testuser',
        email: 'testuser@test.com',
        role: 'developer',
        displayName: 'Test User',
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockNewUser);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'testuser',
          email: 'testuser@test.com',
          password: 'password123',
          role: 'developer',
        })
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user).toHaveProperty('username', 'testuser');
    });

    it('should return 409 if username already exists', async () => {
      const existingUser = { id: 1, username: 'existing' };
      mockPrisma.user.findUnique.mockResolvedValue(existingUser);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'existing',
          email: 'new@test.com',
          password: 'password123',
          role: 'developer',
        })
        .expect(409);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('/api/auth/me (GET)', () => {
    it('should return user profile with valid token', async () => {
      const mockUser = {
        id: 1,
        username: 'manager1',
        email: 'manager1@test.com',
        role: 'manager',
        displayName: 'Manager One',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      // Generate a valid JWT token
      const token = jwtService.sign({
        userId: 1,
        username: 'manager1',
        role: 'manager',
      });

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('username', 'manager1');
      expect(response.body).not.toHaveProperty('passwordHash');
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });
  });
});

describe('Tasks API (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('PrismaService')
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    jwtService = app.get<JwtService>(JwtService);
    
    // Generate auth token for tests
    authToken = jwtService.sign({
      userId: 1,
      username: 'manager1',
      role: 'manager',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/api/tasks (GET)', () => {
    it('should return paginated tasks', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', status: 'pending' },
        { id: 2, title: 'Task 2', status: 'in_progress' },
      ];

      mockPrisma.task.findMany.mockResolvedValue(mockTasks);
      mockPrisma.task.count.mockResolvedValue(2);

      const response = await request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('tasks');
      expect(response.body).toHaveProperty('total');
      expect(response.body.tasks).toHaveLength(2);
    });

    it('should filter tasks by status', async () => {
      const mockTasks = [{ id: 1, title: 'Task 1', status: 'pending' }];

      mockPrisma.task.findMany.mockResolvedValue(mockTasks);
      mockPrisma.task.count.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get('/tasks?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/tasks')
        .expect(401);
    });
  });

  describe('/api/tasks (POST)', () => {
    it('should create a new task', async () => {
      const newTask = {
        title: 'New Test Task',
        description: 'Test Description',
        taskType: 'design',
        priority: 'high',
        assignedTo: 2,
      };

      const mockCreatedTask = { id: 101, ...newTask, status: 'pending' };

      mockPrisma.task.create.mockResolvedValue(mockCreatedTask);
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.taskHistory.create.mockResolvedValue({});

      const response = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTask)
        .expect(201);

      expect(response.body).toHaveProperty('id', 101);
      expect(response.body).toHaveProperty('title', 'New Test Task');
      expect(response.body.status).toBe('pending');
    });
  });

  describe('/api/tasks/:id (GET)', () => {
    it('should return task by id', async () => {
      const mockTask = {
        id: 1,
        title: 'Test Task',
        status: 'pending',
        taskType: 'design',
      };

      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      const response = await request(app.getHttpServer())
        .get('/tasks/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('title', 'Test Task');
    });

    it('should return 404 for non-existent task', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get('/tasks/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/api/tasks/:id (PUT)', () => {
    it('should update task status', async () => {
      const existingTask = { id: 1, title: 'Task', status: 'pending', assignedTo: 1, createdBy: 1 };
      const updatedTask = { ...existingTask, status: 'in_progress' };

      mockPrisma.task.findUnique.mockResolvedValue(existingTask);
      mockPrisma.task.update.mockResolvedValue(updatedTask);
      mockPrisma.taskHistory.create.mockResolvedValue({});

      const response = await request(app.getHttpServer())
        .put('/tasks/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'in_progress' })
        .expect(200);

      expect(response.body.status).toBe('in_progress');
    });
  });

  describe('/api/tasks/:id/claim (POST)', () => {
    it('should claim unassigned task', async () => {
      const unassignedTask = { id: 1, title: 'Task', assignedTo: null };
      const claimedTask = { ...unassignedTask, assignedTo: 3 };

      mockPrisma.task.findUnique.mockResolvedValue(unassignedTask);
      mockPrisma.task.update.mockResolvedValue(claimedTask);
      mockPrisma.taskHistory.create.mockResolvedValue({});

      const devToken = jwtService.sign({
        userId: 3,
        username: 'developer1',
        role: 'developer',
      });

      const response = await request(app.getHttpServer())
        .post('/tasks/1/claim')
        .set('Authorization', `Bearer ${devToken}`)
        .expect(200);

      expect(response.body.assignedTo).toBe(3);
    });
  });

  describe('/api/tasks/:id/status (POST)', () => {
    it('should update task status', async () => {
      const task = { id: 1, title: 'Task', status: 'pending', assignedTo: 3 };

      mockPrisma.task.findUnique.mockResolvedValue(task);
      mockPrisma.task.update.mockResolvedValue({ ...task, status: 'completed' });
      mockPrisma.taskHistory.create.mockResolvedValue({});

      const devToken = jwtService.sign({
        userId: 3,
        username: 'developer1',
        role: 'developer',
      });

      const response = await request(app.getHttpServer())
        .post('/tasks/1/status')
        .set('Authorization', `Bearer ${devToken}`)
        .send({ status: 'completed' })
        .expect(200);

      expect(response.body.status).toBe('completed');
    });
  });
});

describe('Dashboard API (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider('PrismaService')
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    jwtService = app.get<JwtService>(JwtService);
    authToken = jwtService.sign({
      userId: 1,
      username: 'manager1',
      role: 'manager',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('/api/dashboard/summary (GET)', () => {
    it('should return dashboard summary', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);
      mockPrisma.task.count.mockResolvedValue(0);
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 1, username: 'manager1', role: 'manager', isAvailable: true, currentTasks: 0 },
      ]);

      const response = await request(app.getHttpServer())
        .get('/dashboard/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('stats');
      expect(response.body).toHaveProperty('recentTasks');
      expect(response.body).toHaveProperty('agentStatus');
    });
  });

  describe('/api/dashboard/stats (GET)', () => {
    it('should return dashboard statistics', async () => {
      mockPrisma.task.findMany.mockResolvedValue([]);
      mockPrisma.task.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('byStatus');
      expect(response.body).toHaveProperty('byPriority');
      expect(response.body).toHaveProperty('byType');
    });
  });

  describe('/api/dashboard/agents (GET)', () => {
    it('should return all agents status', async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 2, username: 'designer1', role: 'designer', isAvailable: true, currentTasks: 1 },
        { id: 3, username: 'developer1', role: 'developer', isAvailable: true, currentTasks: 2 },
        { id: 4, username: 'developer2', role: 'developer', isAvailable: true, currentTasks: 0 },
        { id: 5, username: 'qa1', role: 'qa', isAvailable: true, currentTasks: 0 },
      ]);

      const response = await request(app.getHttpServer())
        .get('/dashboard/agents')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(4);
      expect(response.body[0]).toHaveProperty('status');
    });
  });
});
