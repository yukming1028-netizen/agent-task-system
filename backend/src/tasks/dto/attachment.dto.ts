import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UploadAttachmentDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  filePath: string;

  @IsOptional()
  fileSize?: number;

  @IsOptional()
  mimeType?: string;
}
