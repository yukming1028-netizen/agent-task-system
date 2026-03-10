import { Module } from '@nestjs/common';
import { AttachmentsController } from './attachments.controller';
import { TasksService } from '../tasks/tasks.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [AttachmentsController],
  providers: [TasksService, PrismaService],
})
export class AttachmentsModule {}
