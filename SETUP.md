# Setup Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

## Database Setup

### Option 1: Using Docker (Recommended)

```bash
docker compose up -d
```

### Option 2: Manual PostgreSQL Setup

1. Create database:
```sql
CREATE DATABASE agent_task_system;
```

2. Update `.env` file in `backend/` directory:
```
DATABASE_URL="postgresql://username:password@localhost:5432/agent_task_system?schema=public"
```

## Backend Setup

```bash
cd backend
npm install

# Run database migrations
npx prisma migrate dev --name init

# Start development server
npm run start:dev
```

Backend will run on: http://localhost:3001

## Frontend Setup

```bash
cd frontend
npm install

# Start development server
npm run dev
```

Frontend will run on: http://localhost:5173

## Create Test Users

After database is set up, run:

```bash
cd backend
node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function create() {
  const hash = await bcrypt.hash('password123', 10);
  const users = [
    { username: 'manager1', email: 'manager1@test.com', role: 'manager', displayName: 'Manager One' },
    { username: 'designer1', email: 'designer1@test.com', role: 'designer', displayName: 'Designer One' },
    { username: 'developer1', email: 'developer1@test.com', role: 'developer', displayName: 'Developer One' },
    { username: 'developer2', email: 'developer2@test.com', role: 'developer', displayName: 'Developer Two' },
    { username: 'qa1', email: 'qa1@test.com', role: 'qa', displayName: 'QA One' },
  ];
  for (const u of users) {
    await prisma.user.upsert({ where: { username: u.username }, update: {}, create: { ...u, passwordHash: hash } });
    console.log('Created:', u.username);
  }
  await prisma.\$disconnect();
}
create();
"
```

## Test Credentials

All test users use password: `password123`

- manager1 (Manager role)
- designer1 (Designer role)
- developer1 (Developer role)
- developer2 (Developer role)
- qa1 (QA role)
