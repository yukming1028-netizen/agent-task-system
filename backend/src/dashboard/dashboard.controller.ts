import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@Request() req: any) {
    return this.dashboardService.getSummary(req.user.userId, req.user.role);
  }

  @Get('tasks')
  getTasks(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
  ) {
    return this.dashboardService.getTasks(
      req.user.userId,
      req.user.role,
      {
        status,
        limit: limit ? parseInt(limit, 10) : undefined,
      },
    );
  }

  @Get('stats')
  getStats(@Request() req: any) {
    return this.dashboardService.getStats(req.user.userId, req.user.role);
  }

  @Get('agents')
  getAgents() {
    return this.dashboardService.getAgents();
  }
}
