import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        displayName: true,
        avatarUrl: true,
        isAvailable: true,
        currentTasks: true,
        maxTasks: true,
        agentStatus: true,
      },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        displayName: true,
        avatarUrl: true,
        isAvailable: true,
        currentTasks: true,
        maxTasks: true,
        agentStatus: true,
        createdTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateData: any) {
    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        displayName: true,
        avatarUrl: true,
        isAvailable: true,
        currentTasks: true,
        maxTasks: true,
      },
    });
  }

  async getAvailability(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        isAvailable: true,
        currentTasks: true,
        maxTasks: true,
        agentStatus: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      userId: user.id,
      username: user.username,
      isAvailable: user.isAvailable && user.currentTasks < user.maxTasks,
      currentTasks: user.currentTasks,
      maxTasks: user.maxTasks,
      agentStatus: user.agentStatus?.status || 'offline',
    };
  }

  async updateAvailability(id: number, isAvailable: boolean) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isAvailable },
    });

    // Also update agent status
    await this.prisma.agentStatus.upsert({
      where: { userId: id },
      update: {
        status: isAvailable ? 'available' : 'busy',
        lastActive: new Date(),
      },
      create: {
        userId: id,
        status: isAvailable ? 'available' : 'busy',
      },
    });

    return {
      userId: user.id,
      isAvailable: user.isAvailable,
    };
  }
}
