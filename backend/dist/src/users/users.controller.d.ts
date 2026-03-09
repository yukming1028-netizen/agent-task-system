import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: number;
        username: string;
        email: string;
        role: string;
        displayName: string | null;
        avatarUrl: string | null;
        isAvailable: boolean;
        currentTasks: number;
        maxTasks: number;
        agentStatus: {
            id: number;
            updatedAt: Date;
            userId: number;
            status: string;
            currentTaskCount: number;
            lastActive: Date;
        } | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        username: string;
        email: string;
        role: string;
        displayName: string | null;
        avatarUrl: string | null;
        isAvailable: boolean;
        currentTasks: number;
        maxTasks: number;
        createdTasks: {
            id: number;
            createdAt: Date;
            status: string;
            title: string;
        }[];
        assignedTasks: {
            id: number;
            createdAt: Date;
            status: string;
            title: string;
        }[];
        agentStatus: {
            id: number;
            updatedAt: Date;
            userId: number;
            status: string;
            currentTaskCount: number;
            lastActive: Date;
        } | null;
    }>;
    getAvailability(id: number): Promise<{
        userId: number;
        username: string;
        isAvailable: boolean;
        currentTasks: number;
        maxTasks: number;
        agentStatus: string;
    }>;
    updateAvailability(id: number, isAvailable: boolean): Promise<{
        userId: number;
        isAvailable: boolean;
    }>;
    update(id: number, updateData: any, req: any): Promise<{
        id: number;
        username: string;
        email: string;
        role: string;
        displayName: string | null;
        avatarUrl: string | null;
        isAvailable: boolean;
        currentTasks: number;
        maxTasks: number;
    }> | {
        error: string;
    };
}
