import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Get(':id/availability')
  getAvailability(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getAvailability(id);
  }

  @Patch(':id/availability')
  updateAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.usersService.updateAvailability(id, isAvailable);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateData: any, @Request() req: any) {
    // Only allow users to update their own profile
    if (req.user.userId !== id && req.user.role !== 'manager') {
      return { error: 'Unauthorized' };
    }
    return this.usersService.update(id, updateData);
  }
}
