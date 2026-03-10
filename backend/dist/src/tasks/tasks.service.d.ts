import { PrismaService } from '../common/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createTaskDto: CreateTaskDto, userId: number): Promise<{
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
    }>;
    findAll(filters: {
        status?: string;
        taskType?: string;
        assignee?: number;
        createdBy?: number;
        page?: number;
        pageSize?: number;
    }): Promise<{
        tasks: ({
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
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    search(searchParams: {
        keyword?: string;
        status?: string;
        taskType?: string;
        priority?: string;
        assignee?: number;
        createdBy?: number;
        dateFrom?: string;
        dateTo?: string;
        page?: number;
        pageSize?: number;
    }): Promise<{
        tasks: ({
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
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<{
        taskHistories: ({
            user: {
                id: number;
                username: string;
                displayName: string | null;
            };
        } & {
            id: number;
            createdAt: Date;
            userId: number;
            comment: string | null;
            action: string;
            oldValue: string | null;
            newValue: string | null;
            taskId: number;
        })[];
        attachments: {
            id: number;
            createdAt: Date;
            taskId: number;
            fileName: string;
            filePath: string;
            fileSize: number | null;
            mimeType: string | null;
            uploadedBy: number;
        }[];
        comments: ({
            user: {
                id: number;
                username: string;
                displayName: string | null;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
            taskId: number;
            content: string;
        })[];
        creator: {
            id: number;
            username: string;
            role: string;
            displayName: string | null;
        };
        assignee: {
            id: number;
            username: string;
            role: string;
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
    }>;
    update(id: number, updateTaskDto: UpdateTaskDto, userId: number): Promise<{
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
    }>;
    remove(id: number, userId: number): Promise<{
        success: boolean;
        message: string;
    }>;
    claimTask(taskId: number, userId: number): Promise<{
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
    }>;
    submitForReview(taskId: number, userId: number): Promise<{
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
    }>;
    completeTask(taskId: number, userId: number): Promise<{
        task: {
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
        };
        nextTask: ({
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
        }) | null;
    }>;
    private createChildTask;
}
