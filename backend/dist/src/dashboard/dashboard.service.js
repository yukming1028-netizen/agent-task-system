"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSummary(userId, role) {
        const [taskStats, agentStats] = await Promise.all([
            this.getTaskStats(userId, role),
            this.getAgentStats(),
        ]);
        return {
            taskStats,
            agentStats,
        };
    }
    async getTaskStats(userId, role) {
        let whereClause = {};
        if (role !== 'manager') {
            whereClause = {
                OR: [
                    { assignedTo: userId },
                    { createdBy: userId },
                ],
            };
        }
        const [total, pending, inProgress, review, completed] = await Promise.all([
            this.prisma.task.count({ where: whereClause }),
            this.prisma.task.count({ where: { ...whereClause, status: 'pending' } }),
            this.prisma.task.count({ where: { ...whereClause, status: 'in_progress' } }),
            this.prisma.task.count({ where: { ...whereClause, status: 'review' } }),
            this.prisma.task.count({ where: { ...whereClause, status: 'completed' } }),
        ]);
        return {
            total,
            pending,
            inProgress,
            review,
            completed,
        };
    }
    async getAgentStats() {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                displayName: true,
                role: true,
                isAvailable: true,
                currentTasks: true,
                maxTasks: true,
                agentStatus: true,
            },
        });
        return users.map((user) => ({
            userId: user.id,
            username: user.username,
            displayName: user.displayName || user.username,
            role: user.role,
            status: user.agentStatus?.status || (user.isAvailable ? 'available' : 'offline'),
            currentTasks: user.currentTasks,
            maxTasks: user.maxTasks,
            isAvailable: user.isAvailable && user.currentTasks < user.maxTasks,
        }));
    }
    async getTasks(userId, role, filters) {
        const limit = filters?.limit || 10;
        let whereClause = {};
        if (filters?.status) {
            whereClause.status = filters.status;
        }
        if (role !== 'manager') {
            whereClause = {
                ...whereClause,
                OR: [
                    { assignedTo: userId },
                    { createdBy: userId },
                ],
            };
        }
        return this.prisma.task.findMany({
            where: whereClause,
            include: {
                creator: {
                    select: { id: true, username: true, displayName: true },
                },
                assignee: {
                    select: { id: true, username: true, displayName: true },
                },
            },
            orderBy: { updatedAt: 'desc' },
            take: limit,
        });
    }
    async getStats(userId, role) {
        let whereClause = {};
        if (role !== 'manager') {
            whereClause = {
                OR: [
                    { assignedTo: userId },
                    { createdBy: userId },
                ],
            };
        }
        const [completed, inProgress, pending] = await Promise.all([
            this.prisma.task.count({ where: { ...whereClause, status: 'completed' } }),
            this.prisma.task.count({ where: { ...whereClause, status: 'in_progress' } }),
            this.prisma.task.count({ where: { ...whereClause, status: 'pending' } }),
        ]);
        return {
            completed,
            inProgress,
            pending,
        };
    }
    async getAgents() {
        const users = await this.prisma.user.findMany({
            select: {
                id: true,
                username: true,
                displayName: true,
                role: true,
                isAvailable: true,
                currentTasks: true,
                maxTasks: true,
                agentStatus: true,
            },
        });
        return users.map((user) => ({
            userId: user.id,
            username: user.username,
            displayName: user.displayName || user.username,
            role: user.role,
            status: user.agentStatus?.status || (user.isAvailable ? 'available' : 'offline'),
            currentTasks: user.currentTasks,
            maxTasks: user.maxTasks,
            availability: user.isAvailable && user.currentTasks < user.maxTasks ? 'available' : 'busy',
        }));
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map