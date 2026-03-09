import { WorkflowService } from './workflow.service';
export declare class WorkflowController {
    private readonly workflowService;
    constructor(workflowService: WorkflowService);
    designToDev(id: number, req: any): Promise<{
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
    devToQa(id: number, req: any): Promise<{
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
