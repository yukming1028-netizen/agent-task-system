import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary(@Request() req) {
    return this.dashboardService.getSummary(req.user.userId, req.user.role);
  }

  @Get('stats')
  async getStats(@Request() req) {
    return this.dashboardService.getStats(req.user.userId, req.user.role);
  }

  @Get('agents')
  async getAgents() {
    return this.dashboardService.getAgents();
  }
}
