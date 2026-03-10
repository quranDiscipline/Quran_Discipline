import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class BlockDateDto {
  @ApiProperty({
    description: 'Teacher ID (optional - if not provided, blocks all teachers)',
    required: false,
  })
  @IsOptional()
  @IsString()
  teacherId?: string;

  @ApiProperty({
    description: 'Date to block in YYYY-MM-DD format',
    example: '2026-12-25',
  })
  @IsDateString()
  date!: string;

  @ApiProperty({
    description: 'Reason for blocking the date',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
