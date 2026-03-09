import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getSummary(req: any): Promise<{
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
    getTasks(req: any, status?: string, limit?: string): Promise<({
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
    getStats(req: any): Promise<{
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
