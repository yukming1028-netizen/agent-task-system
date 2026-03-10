import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto, req: any): Promise<{
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
    findAll(status?: string, taskType?: string, assignee?: string, createdBy?: string, page?: string, pageSize?: string): Promise<{
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
    update(id: number, updateTaskDto: UpdateTaskDto, req: any): Promise<{
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
    remove(id: number, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    claimTask(id: number, req: any): Promise<{
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
    submitForReview(id: number, req: any): Promise<{
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
    updateStatus(id: number, status: string, req: any): Promise<{
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
    completeTask(id: number, req: any): Promise<{
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
    search(keyword?: string, status?: string, taskType?: string, priority?: string, assignee?: string, createdBy?: string, dateFrom?: string, dateTo?: string, page?: string, pageSize?: string): Promise<{
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
    getAttachments(id: number): Promise<({
        user: {
            id: number;
            username: string;
            displayName: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        taskId: number;
        fileName: string;
        filePath: string;
        fileSize: number | null;
        mimeType: string | null;
        uploadedBy: number;
    })[]>;
    deleteAttachment(id: number, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
