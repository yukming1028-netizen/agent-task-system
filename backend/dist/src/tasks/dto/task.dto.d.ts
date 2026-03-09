export declare class CreateTaskDto {
    title: string;
    description?: string;
    taskType: string;
    priority?: string;
    assignedTo?: number;
    dueDate?: string;
}
export declare class UpdateTaskDto {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    assignedTo?: number;
    dueDate?: string;
}
