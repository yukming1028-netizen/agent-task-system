import { PrismaService } from '../common/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getSummary(userId: number, role: string): Promise<{
        taskStats: {
            total: number;
            pending: number;
            inProgress: number;
            review: number;
            completed: number;
        };
        agentStats: {
            userId: number;
            username: string;
            displayName: string;
            role: string;
            status: string;
            currentTasks: number;
            maxTasks: number;
            isAvailable: boolean;
        }[];
    }>;
    private getTaskStats;
    private getAgentStats;
    getTasks(userId: number, role: string, filters?: {
        status?: string;
        limit?: number;
    }): Promise<({
        creator: {
            id: number;
            username: string;
            displayName: string | null;
        };
        assignee: {
            id: number;
            username: string;
            displayName: string | null;
        } | null;
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
    getStats(userId: number, role: string): Promise<{
        completed: number;
        inProgress: number;
        pending: number;
    }>;
    getAgents(): Promise<{
        userId: number;
        username: string;
        displayName: string;
        role: string;
        status: string;
        currentTasks: number;
        maxTasks: number;
        availability: string;
    }[]>;
}
