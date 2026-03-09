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
exports.WorkflowService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma.service");
let WorkflowService = class WorkflowService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async designToDev(designTaskId, userId) {
        const designTask = await this.prisma.task.findUnique({
            where: { id: designTaskId },
        });
        if (!designTask) {
            throw new common_1.NotFoundException('Design task not found');
        }
        if (designTask.taskType !== 'design') {
            throw new Error('This is not a design task');
        }
        await this.prisma.task.update({
            where: { id: designTaskId },
            data: { status: 'completed', completedAt: new Date() },
        });
        const devTask = await this.prisma.task.create({
            data: {
                title: `Dev: ${designTask.title}`,
                description: `Development task based on design: ${designTask.description}`,
                taskType: 'development',
                priority: designTask.priority,
                status: 'pending',
                createdBy: userId,
                parentTaskId: designTaskId,
                dueDate: designTask.dueDate,
            },
        });
        await this.prisma.taskHistory.create({
            data: {
                taskId: devTask.id,
                userId,
                action: 'created',
                newValue: 'pending',
                comment: 'Auto-created from design task completion',
            },
        });
        return devTask;
    }
    async devToQa(devTaskId, userId) {
        const devTask = await this.prisma.task.findUnique({
            where: { id: devTaskId },
        });
        if (!devTask) {
            throw new common_1.NotFoundException('Development task not found');
        }
        if (devTask.taskType !== 'development') {
            throw new Error('This is not a development task');
        }
        await this.prisma.task.update({
            where: { id: devTaskId },
            data: { status: 'completed', completedAt: new Date() },
        });
        const qaTask = await this.prisma.task.create({
            data: {
                title: `QA: ${devTask.title}`,
                description: `QA testing task based on development: ${devTask.description}`,
                taskType: 'qa',
                priority: devTask.priority,
                status: 'pending',
                createdBy: userId,
                parentTaskId: devTaskId,
                dueDate: devTask.dueDate,
            },
        });
        await this.prisma.taskHistory.create({
            data: {
                taskId: qaTask.id,
                userId,
                action: 'created',
                newValue: 'pending',
                comment: 'Auto-created from development task completion',
            },
        });
        return qaTask;
    }
    async getPendingAssignments() {
        const pendingTasks = await this.prisma.task.findMany({
            where: {
                status: 'pending',
                assignedTo: null,
            },
            include: {
                creator: {
                    select: { id: true, username: true, displayName: true },
                },
            },
            orderBy: {
                priority: 'desc',
            },
        });
        return pendingTasks;
    }
    async getAvailableDevelopers() {
        const developers = await this.prisma.user.findMany({
            where: {
                role: 'developer',
                isAvailable: true,
            },
            include: {
                agentStatus: true,
            },
        });
        return developers.filter((dev) => dev.currentTasks < dev.maxTasks);
    }
};
exports.WorkflowService = WorkflowService;
exports.WorkflowService = WorkflowService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkflowService);
//# sourceMappingURL=workflow.service.js.map