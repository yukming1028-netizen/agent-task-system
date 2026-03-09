import { PrismaService } from '../common/prisma.service';
export declare class WorkflowService {
    private prisma;
    constructor(prisma: PrismaService);
    designToDev(designTaskId: number, userId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        description: string | null;
        taskType: string;
        priority: string;
        assignedTo: number | null;
        dueDate: Date | null;
        completedAt: Date | null;
        createdBy: number;
        parentTaskId: number | null;
    }>;
    devToQa(devTaskId: number, userId: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        description: string | null;
        taskType: string;
        priority: string;
        assignedTo: number | null;
        dueDate: Date | null;
        completedAt: Date | null;
        createdBy: number;
        parentTaskId: number | null;
    }>;
    getPendingAssignments(): Promise<({
        creator: {
            id: number;
            username: string;
            displayName: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        title: string;
        description: string | null;
        taskType: string;
        priority: string;
        assignedTo: number | null;
        dueDate: Date | null;
        completedAt: Date | null;
        createdBy: number;
        parentTaskId: number | null;
    })[]>;
    getAvailableDevelopers(): Promise<({
        agentStatus: {
            id: number;
            updatedAt: Date;
            userId: number;
            status: string;
            currentTaskCount: number;
            lastActive: Date;
        } | null;
    } & {
        id: number;
        username: string;
        email: string;
        passwordHash: string;
        role: string;
        displayName: string | null;
        avatarUrl: string | null;
        isAvailable: boolean;
        currentTasks: number;
        maxTasks: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
}
