import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('workflow')
@UseGuards(JwtAuthGuard)
export class WorkflowController {
  constructor(private workflowService: WorkflowService) {}

  /**
   * 設計完成 → 創建開發任務
   */
  @Post('design-to-dev/:taskId')
  async designToDev(
    @Param('taskId') taskId: string,
    @Request() req,
  ) {
    return this.workflowService.designToDev(
      parseInt(taskId),
      req.user.userId,
    );
  }

  /**
   * 開發完成 → 創建 QA 任務
   */
  @Post('dev-to-qa/:taskId')
  async devToQa(
    @Param('taskId') taskId: string,
    @Request() req,
  ) {
    return this.workflowService.devToQa(
      parseInt(taskId),
      req.user.userId,
    );
  }

  /**
   * 獲取待分配任務
   */
  @Get('pending-assignments')
  async getPendingAssignments(
    @Query('role') role?: string,
  ) {
    return this.workflowService.getPendingAssignments(role);
  }

  /**
   * 獲取用戶任務歷史
   */
  @Get('history')
  async getUserTaskHistory(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    return this.workflowService.getUserTaskHistory(
      req.user.userId,
      limit ? parseInt(limit) : 50,
    );
  }

  /**
   * 獲取任務工作流鏈
   */
  @Get('chain/:taskId')
  async getTaskWorkflowChain(
    @Param('taskId') taskId: string,
  ) {
    return this.workflowService.getTaskWorkflowChain(
      parseInt(taskId),
    );
  }
}
