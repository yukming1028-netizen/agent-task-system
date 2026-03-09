import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateUserDto {
  username: string;
  email: string;
  passwordHash: string;
  role: string;
  displayName?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        displayName: true,
        isAvailable: true,
        currentTasks: true,
      },
    });
  }

  async create(data: CreateUserDto) {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: number, data: Partial<CreateUserDto>) {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async updateAvailability(userId: number, isAvailable: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isAvailable },
    });
  }

  async getAvailableAgents(role?: string) {
    const where: any = {
      isAvailable: true,
      currentTasks: { lt: 5 }, // maxTasks default
    };
    if (role) {
      where.role = role;
    }
    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        currentTasks: true,
      },
    });
  }
}
