# Agent Task Management System

A task management system for managing agent workflows (Manager → Designer → Developer → QA).

## Phase 1 (MVP) Features

- ✅ User Authentication (Login/Register/JWT)
- ✅ Task CRUD Operations
- ✅ Basic Dashboard with Statistics
- ✅ Task Status Updates
- ✅ Simple Task Assignment
- ✅ Agent Availability Status

## Tech Stack

### Backend
- NestJS + TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt for password hashing

### Frontend
- React 18 + TypeScript
- Ant Design UI
- Vite
- React Router
- Axios

## Quick Start

### 1. Start Database

```bash
cd agent-task-system
docker-compose up -d
```

### 2. Setup Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run start:dev
```

Backend runs on: http://localhost:3001

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get task list
- `GET /api/tasks/:id` - Get task details
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/claim` - Claim a task
- `POST /api/tasks/:id/status` - Update task status

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/agents` - Get agent status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user details
- `GET /api/users/:id/availability` - Get user availability
- `PUT /api/users/:id/availability` - Update availability

## Default Test Users

Create these users for testing:

| Username | Role | Purpose |
|----------|------|---------|
| manager1 | manager | Create and assign tasks |
| designer1 | designer | Design tasks |
| developer1 | developer | Development tasks |
| developer2 | developer | Development tasks |
| qa1 | qa | QA testing tasks |

## Project Structure

```
agent-task-system/
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── users/         # Users module
│   │   ├── tasks/         # Tasks module
│   │   ├── dashboard/     # Dashboard module
│   │   ├── prisma/        # Prisma service
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx
│   └── package.json
├── docker-compose.yml
└── README.md
```

## Next Steps (Phase 2)

- [ ] Design → Dev auto handoff
- [ ] Dev → QA auto handoff
- [ ] Enhanced agent availability tracking
- [ ] Task claiming mechanism
- [ ] Task history improvements

---

**Developer:** Developer2  
**Phase:** 1 (MVP)  
**Status:** Development Complete
