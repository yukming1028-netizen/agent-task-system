#!/bin/bash

# Initialize database and create test users

echo "🚀 Starting database initialization..."

cd backend

# Run Prisma migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate dev --name init

# Create test users using a Node.js script
echo "👥 Creating test users..."
cat > create-users.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const testUsers = [
  { username: 'manager1', email: 'manager1@test.com', role: 'manager', displayName: 'Manager One' },
  { username: 'designer1', email: 'designer1@test.com', role: 'designer', displayName: 'Designer One' },
  { username: 'developer1', email: 'developer1@test.com', role: 'developer', displayName: 'Developer One' },
  { username: 'developer2', email: 'developer2@test.com', role: 'developer', displayName: 'Developer Two' },
  { username: 'qa1', email: 'qa1@test.com', role: 'qa', displayName: 'QA One' },
];

async function createUsers() {
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  for (const userData of testUsers) {
    try {
      const user = await prisma.user.upsert({
        where: { username: userData.username },
        update: {},
        create: {
          ...userData,
          passwordHash,
        },
      });
      console.log(`✅ Created user: ${userData.username} (${userData.role})`);
    } catch (error) {
      console.error(`❌ Failed to create ${userData.username}:`, error.message);
    }
  }

  await prisma.$disconnect();
  console.log('\n🎉 Test users created successfully!');
  console.log('📝 Login credentials: username + password: password123');
}

createUsers().catch(console.error);
EOF

node create-users.js

echo ""
echo "✅ Database initialization complete!"
echo ""
echo "📊 Test Users:"
echo "   - manager1 / password123"
echo "   - designer1 / password123"
echo "   - developer1 / password123"
echo "   - developer2 / password123"
echo "   - qa1 / password123"
echo ""
