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
        })[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<{
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
        taskHistories: ({
            user: {
                id: number;
                username: string;
                displayName: string | null;
            };
        } & {
            createdAt: Date;
            id: number;
            taskId: number;
            userId: number;
            action: string;
            oldValue: string | null;
            newValue: string | null;
            comment: string | null;
        })[];
        attachments: {
            createdAt: Date;
            id: number;
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
            createdAt: Date;
            updatedAt: Date;
            id: number;
            taskId: number;
            userId: number;
            content: string;
        })[];
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
}
