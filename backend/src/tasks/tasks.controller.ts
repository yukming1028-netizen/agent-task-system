import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @Request() req: any) {
    return this.tasksService.create(createTaskDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('taskType') taskType?: string,
    @Query('assignee') assignee?: string,
    @Query('createdBy') createdBy?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.tasksService.findAll({
      status,
      taskType,
      assignee: assignee ? parseInt(assignee, 10) : undefined,
      createdBy: createdBy ? parseInt(createdBy, 10) : undefined,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 20,
    });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req: any,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.tasksService.remove(id, req.user.userId);
  }

  @Post(':id/claim')
  claimTask(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.tasksService.claimTask(id, req.user.userId);
  }

  @Post(':id/submit')
  submitForReview(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.tasksService.submitForReview(id, req.user.userId);
  }

  @Post(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
    @Request() req: any,
  ) {
    return this.tasksService.update(id, { status }, req.user.userId);
  }

  @Post(':id/complete')
  completeTask(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.tasksService.completeTask(id, req.user.userId);
  }
}
