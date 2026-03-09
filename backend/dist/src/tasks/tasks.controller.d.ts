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
