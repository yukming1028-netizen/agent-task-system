import { WorkflowService } from './workflow.service';
export declare class WorkflowController {
    private readonly workflowService;
    constructor(workflowService: WorkflowService);
    designToDev(id: number, req: any): Promise<{
        title: string;
        description: string | null;
        taskType: string;
        priority: string;
        status: string;
        dueDate: Date | null;
        completedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        createdBy: number;
        assignedTo: number | null;
        parentTaskId: number | null;
    }>;
    devToQa(id: number, req: any): Promise<{
        title: string;
        description: string | null;
        taskType: string;
        priority: string;
        status: string;
        dueDate: Date | null;
        completedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        createdBy: number;
        assignedTo: number | null;
        parentTaskId: number | null;
    }>;
    getPendingAssignments(): Promise<({
        creator: {
            id: number;
            username: string;
            displayName: string | null;
        };
    } & {
        title: string;
        description: string | null;
        taskType: string;
        priority: string;
        status: string;
        dueDate: Date | null;
        completedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        createdBy: number;
        assignedTo: number | null;
        parentTaskId: number | null;
    })[]>;
    getAvailableDevelopers(): Promise<({
        agentStatus: {
            status: string;
            updatedAt: Date;
            id: number;
            userId: number;
            currentTaskCount: number;
            lastActive: Date;
        } | null;
    } & {
        createdAt: Date;
        updatedAt: Date;
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
    })[]>;
}
