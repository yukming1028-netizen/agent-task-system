import {
  Controller,
  Get,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Workflow')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post('design-to-dev/:id')
  designToDev(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.workflowService.designToDev(id, req.user.userId);
  }

  @Post('dev-to-qa/:id')
  devToQa(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.workflowService.devToQa(id, req.user.userId);
  }

  @Get('pending-assignments')
  getPendingAssignments() {
    return this.workflowService.getPendingAssignments();
  }

  @Get('available-developers')
  getAvailableDevelopers() {
    return this.workflowService.getAvailableDevelopers();
  }
}
