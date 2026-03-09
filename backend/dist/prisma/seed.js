"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Start seeding...');
    const passwordHash = await bcrypt.hash('password123', 10);
    const manager = await prisma.user.upsert({
        where: { username: 'manager' },
        update: {},
        create: {
            username: 'manager',
            email: 'manager@example.com',
            passwordHash,
            role: 'manager',
            displayName: 'Manager User',
            isAvailable: true,
            maxTasks: 10,
        },
    });
    const designer = await prisma.user.upsert({
        where: { username: 'designer' },
        update: {},
        create: {
            username: 'designer',
            email: 'designer@example.com',
            passwordHash,
            role: 'designer',
            displayName: 'Designer User',
            isAvailable: true,
            maxTasks: 5,
        },
    });
    const developer = await prisma.user.upsert({
        where: { username: 'developer' },
        update: {},
        create: {
            username: 'developer',
            email: 'developer@example.com',
            passwordHash,
            role: 'developer',
            displayName: 'Developer User',
            isAvailable: true,
            maxTasks: 5,
        },
    });
    const developer2 = await prisma.user.upsert({
        where: { username: 'developer2' },
        update: {},
        create: {
            username: 'developer2',
            email: 'developer2@example.com',
            passwordHash,
            role: 'developer',
            displayName: 'Developer 2',
            isAvailable: true,
            maxTasks: 5,
        },
    });
    const qa = await prisma.user.upsert({
        where: { username: 'qa' },
        update: {},
        create: {
            username: 'qa',
            email: 'qa@example.com',
            passwordHash,
            role: 'qa',
            displayName: 'QA User',
            isAvailable: true,
            maxTasks: 5,
        },
    });
    await prisma.agentStatus.upsert({
        where: { userId: manager.id },
        update: { status: 'available' },
        create: { userId: manager.id, status: 'available' },
    });
    await prisma.agentStatus.upsert({
        where: { userId: designer.id },
        update: { status: 'available' },
        create: { userId: designer.id, status: 'available' },
    });
    await prisma.agentStatus.upsert({
        where: { userId: developer.id },
        update: { status: 'available' },
        create: { userId: developer.id, status: 'available' },
    });
    await prisma.agentStatus.upsert({
        where: { userId: developer2.id },
        update: { status: 'available' },
        create: { userId: developer2.id, status: 'available' },
    });
    await prisma.agentStatus.upsert({
        where: { userId: qa.id },
        update: { status: 'available' },
        create: { userId: qa.id, status: 'available' },
    });
    console.log('Seeding finished.');
    console.log('Test users created:');
    console.log('  - manager / password123');
    console.log('  - designer / password123');
    console.log('  - developer / password123');
    console.log('  - developer2 / password123');
    console.log('  - qa / password123');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map