import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService, CreateTaskDto } from './tasks.service';
import type { UpdateTaskDto } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class CreateTaskRequestDto implements Omit<CreateTaskDto, 'createdBy'> {
  title: string;
  description?: string;
  taskType: string;
  priority?: string = 'medium';
  assignedTo?: number;
  dueDate?: Date;
}

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  async findAll(
    @Request() req,
    @Query('status') status?: string,
    @Query('assignee') assignee?: string,
    @Query('taskType') taskType?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const filters: any = {
      page: page ? parseInt(page) : 1,
      pageSize: pageSize ? parseInt(pageSize) : 20,
    };
    
    if (status) filters.status = status;
    if (assignee) filters.assignee = parseInt(assignee);
    if (taskType) filters.taskType = taskType;

    // If no specific filters, show tasks relevant to user
    if (!status && !assignee && !taskType) {
      const userRole = req.user.role;
      if (userRole === 'manager') {
        filters.createdBy = req.user.userId;
      } else {
        filters.assignee = req.user.userId;
      }
    }

    return this.tasksService.findAll(filters);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.tasksService.findById(parseInt(id));
  }

  @Post()
  async create(@Request() req, @Body() body: CreateTaskRequestDto) {
    return this.tasksService.create({
      ...body,
      createdBy: req.user.userId,
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: UpdateTaskDto,
    @Request() req,
  ) {
    return this.tasksService.update(
      parseInt(id),
      body,
      req.user.userId,
      req.user.role,
    );
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return this.tasksService.delete(
      parseInt(id),
      req.user.userId,
      req.user.role,
    );
  }

  @Post(':id/claim')
  async claimTask(@Param('id') id: string, @Request() req) {
    return this.tasksService.claimTask(parseInt(id), req.user.userId);
  }

  @Post(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @Request() req,
  ) {
    return this.tasksService.updateStatus(parseInt(id), status, req.user.userId);
  }
}
