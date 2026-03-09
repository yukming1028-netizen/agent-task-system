import { Controller, Get, Put, Param, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.usersService.findById(parseInt(id));
  }

  @Get(':id/availability')
  async getAvailability(@Param('id') id: string) {
    const user = await this.usersService.findById(parseInt(id));
    return {
      userId: parseInt(id),
      isAvailable: user?.isAvailable,
      currentTasks: user?.currentTasks,
    };
  }

  @Put(':id/availability')
  async updateAvailability(
    @Param('id') id: string,
    @Body() body: { isAvailable: boolean },
  ) {
    return this.usersService.updateAvailability(parseInt(id), body.isAvailable);
  }

  @Get('available')
  async getAvailableAgents(@Request() req, @Body('role') role?: string) {
    // Exclude current user from available agents
    const agents = await this.usersService.getAvailableAgents(role);
    return agents.filter(agent => agent.id !== req.user.userId);
  }
}
