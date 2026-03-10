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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma.service");
let TasksService = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createTaskDto, userId) {
        const task = await this.prisma.task.create({
            data: {
                title: createTaskDto.title,
                description: createTaskDto.description,
                taskType: createTaskDto.taskType,
                priority: createTaskDto.priority || 'medium',
                status: 'pending',
                createdBy: userId,
                assignedTo: createTaskDto.assignedTo,
                dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
            },
            include: {
                creator: {
                    select: { id: true, username: true, displayName: true },
                },
                assignee: {
                    select: { id: true, username: true, displayName: true },
                },
            },
        });
        await this.prisma.taskHistory.create({
            data: {
                taskId: task.id,
                userId,
                action: 'created',
                newValue: task.status,
            },
        });
        return task;
    }
    async findAll(filters) {
        const { page = 1, pageSize = 20, ...where } = filters;
        const skip = (page - 1) * pageSize;
        const [tasks, total] = await Promise.all([
            this.prisma.task.findMany({
                where: where,
                include: {
                    creator: {
                        select: { id: true, username: true, displayName: true },
                    },
                    assignee: {
                        select: { id: true, username: true, displayName: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            this.prisma.task.count({ where: where }),
        ]);
        return {
            tasks,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
    async search(searchParams) {
        const { page = 1, pageSize = 20, keyword, dateFrom, dateTo, ...filters } = searchParams;
        const skip = (page - 1) * pageSize;
        const where = { ...filters };
        if (keyword) {
            where.OR = [
                { title: { contains: keyword, mode: 'insensitive' } },
                { description: { contains: keyword, mode: 'insensitive' } },
            ];
        }
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom)
                where.createdAt.gte = new Date(dateFrom);
            if (dateTo)
                where.createdAt.lte = new Date(dateTo);
        }
        const [tasks, total] = await Promise.all([
            this.prisma.task.findMany({
                where,
                include: {
                    creator: {
                        select: { id: true, username: true, displayName: true },
                    },
                    assignee: {
                        select: { id: true, username: true, displayName: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: pageSize,
            }),
            this.prisma.task.count({ where }),
        ]);
        return {
            tasks,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
    async findOne(id) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: {
                creator: {
                    select: { id: true, username: true, displayName: true, role: true },
                },
                assignee: {
                    select: { id: true, username: true, displayName: true, role: true },
                },
                taskHistories: {
                    include: {
                        user: {
                            select: { id: true, username: true, displayName: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                attachments: true,
                comments: {
                    include: {
                        user: {
                            select: { id: true, username: true, displayName: true },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        return task;
    }
    async update(id, updateTaskDto, userId) {
        const task = await this.findOne(id);
        if (task.assignedTo !== userId && task.createdBy !== userId) {
            throw new common_1.ForbiddenException('You can only update tasks assigned to you or created by you');
        }
        const updateData = { ...updateTaskDto };
        if (updateTaskDto.dueDate) {
            updateData.dueDate = new Date(updateTaskDto.dueDate);
        }
        if (updateTaskDto.status && updateTaskDto.status !== task.status) {
            await this.prisma.taskHistory.create({
                data: {
                    taskId: id,
                    userId,
                    action: 'status_changed',
                    oldValue: task.status,
                    newValue: updateTaskDto.status,
                },
            });
            if (updateTaskDto.status === 'completed') {
                updateData.completedAt = new Date();
            }
        }
        return this.prisma.task.update({
            where: { id },
            data: updateData,
            include: {
                creator: {
                    select: { id: true, username: true, displayName: true },
                },
                assignee: {
                    select: { id: true, username: true, displayName: true },
                },
            },
        });
    }
    async remove(id, userId) {
        const task = await this.findOne(id);
        if (task.createdBy !== userId) {
            throw new common_1.ForbiddenException('Only the task creator can delete the task');
        }
        await this.prisma.task.delete({
            where: { id },
        });
        return { success: true, message: 'Task deleted successfully' };
    }
    async claimTask(taskId, userId) {
        const task = await this.findOne(taskId);
        if (task.status !== 'pending') {
            throw new common_1.ForbiddenException('Only pending tasks can be claimed');
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.currentTasks >= user.maxTasks) {
            throw new common_1.ForbiddenException('You have reached your maximum task limit');
        }
        const updatedTask = await this.prisma.task.update({
            where: { id: taskId },
            data: {
                assignedTo: userId,
                status: 'in_progress',
            },
            include: {
                creator: {
                    select: { id: true, username: true, displayName: true },
                },
                assignee: {
                    select: { id: true, username: true, displayName: true },
                },
            },
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: { currentTasks: { increment: 1 } },
        });
        await this.prisma.agentStatus.update({
            where: { userId },
            data: {
                currentTaskCount: { increment: 1 },
                status: 'busy',
                lastActive: new Date(),
            },
        });
        await this.prisma.taskHistory.create({
            data: {
                taskId,
                userId,
                action: 'assigned',
                newValue: 'in_progress',
                comment: 'Task claimed by user',
            },
        });
        return updatedTask;
    }
    async submitForReview(taskId, userId) {
        const task = await this.findOne(taskId);
        if (task.assignedTo !== userId) {
            throw new common_1.ForbiddenException('You can only submit tasks assigned to you');
        }
        const updatedTask = await this.prisma.task.update({
            where: { id: taskId },
            data: {
                status: 'review',
            },
            include: {
                creator: {
                    select: { id: true, username: true, displayName: true },
                },
                assignee: {
                    select: { id: true, username: true, displayName: true },
                },
            },
        });
        await this.prisma.taskHistory.create({
            data: {
                taskId,
                userId,
                action: 'status_changed',
                oldValue: 'in_progress',
                newValue: 'review',
                comment: 'Submitted for review',
            },
        });
        return updatedTask;
    }
    async completeTask(taskId, userId) {
        const task = await this.findOne(taskId);
        if (task.assignedTo !== userId) {
            throw new common_1.ForbiddenException('You can only complete tasks assigned to you');
        }
        const updatedTask = await this.prisma.task.update({
            where: { id: taskId },
            data: {
                status: 'completed',
                completedAt: new Date(),
            },
            include: {
                creator: {
                    select: { id: true, username: true, displayName: true },
                },
                assignee: {
                    select: { id: true, username: true, displayName: true },
                },
            },
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: { currentTasks: { decrement: 1 } },
        });
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.ForbiddenException('User not found');
        }
        const newTaskCount = Math.max(0, user.currentTasks - 1);
        await this.prisma.agentStatus.update({
            where: { userId },
            data: {
                currentTaskCount: newTaskCount,
                status: newTaskCount < user.maxTasks ? 'available' : 'busy',
                lastActive: new Date(),
            },
        });
        await this.prisma.taskHistory.create({
            data: {
                taskId,
                userId,
                action: 'completed',
                newValue: 'completed',
                comment: 'Task completed',
            },
        });
        let nextTask = null;
        if (task.taskType === 'design') {
            nextTask = await this.createChildTask(taskId, 'development', userId);
        }
        else if (task.taskType === 'development') {
            nextTask = await this.createChildTask(taskId, 'qa', userId);
        }
        return {
            task: updatedTask,
            nextTask,
        };
    }
    async createChildTask(parentTaskId, taskType, userId) {
        const parentTask = await this.prisma.task.findUnique({
            where: { id: parentTaskId },
        });
        if (!parentTask) {
            return null;
        }
        const taskTypeTitles = {
            development: 'Dev',
            qa: 'QA',
        };
        const roleForTaskType = {
            development: 'developer',
            qa: 'qa',
        };
        const availableUsers = await this.prisma.user.findMany({
            where: {
                role: roleForTaskType[taskType],
                isAvailable: true,
                currentTasks: { lt: 5 },
            },
            orderBy: {
                currentTasks: 'asc',
            },
            take: 1,
        });
        const assignedTo = availableUsers.length > 0 ? availableUsers[0].id : null;
        const childTask = await this.prisma.task.create({
            data: {
                title: `${taskTypeTitles[taskType]}: ${parentTask.title}`,
                description: `Auto-created from ${parentTask.taskType} task: ${parentTask.description}`,
                taskType,
                priority: parentTask.priority,
                status: assignedTo ? 'in_progress' : 'pending',
                createdBy: userId,
                assignedTo,
                parentTaskId,
                dueDate: parentTask.dueDate,
            },
            include: {
                creator: {
                    select: { id: true, username: true, displayName: true },
                },
                assignee: {
                    select: { id: true, username: true, displayName: true },
                },
            },
        });
        if (assignedTo) {
            await this.prisma.user.update({
                where: { id: assignedTo },
                data: { currentTasks: { increment: 1 } },
            });
            await this.prisma.agentStatus.update({
                where: { userId: assignedTo },
                data: {
                    currentTaskCount: { increment: 1 },
                    status: 'busy',
                    lastActive: new Date(),
                },
            });
        }
        await this.prisma.taskHistory.create({
            data: {
                taskId: childTask.id,
                userId,
                action: 'created',
                newValue: childTask.status,
                comment: `Auto-created from ${parentTask.taskType} completion`,
            },
        });
        return childTask;
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map