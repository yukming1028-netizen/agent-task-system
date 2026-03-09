import { IsString, IsNotEmpty, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['design', 'development', 'qa'])
  @IsNotEmpty()
  taskType: string;

  @IsEnum(['low', 'medium', 'high', 'urgent'])
  @IsOptional()
  priority?: string;

  @IsNumber()
  @IsOptional()
  assignedTo?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['low', 'medium', 'high', 'urgent'])
  @IsOptional()
  priority?: string;

  @IsEnum(['pending', 'in_progress', 'review', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  assignedTo?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
