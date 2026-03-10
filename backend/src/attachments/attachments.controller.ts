import {
  Controller,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TasksService } from '../tasks/tasks.service';

interface MulterFile {
  originalname: string;
  path: string;
  size: number;
  mimetype: string;
}

@ApiTags('Attachments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/tasks/:taskId/attachments')
export class AttachmentsController {
  constructor(private tasksService: TasksService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req: any, file: any, callback: any) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
      },
      fileFilter: (req: any, file: any, callback: any) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
        const fileExt = allowedTypes.test(extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (fileExt && mimetype) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
    }),
  )
  async uploadAttachment(
    @Param('taskId', ParseIntPipe) taskId: number,
    @UploadedFile() file: MulterFile,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const attachment = await this.tasksService.createAttachment(
      taskId,
      file.originalname,
      file.path,
      file.size,
      file.mimetype,
      req.user.userId,
    );

    return {
      success: true,
      data: attachment,
    };
  }
}
