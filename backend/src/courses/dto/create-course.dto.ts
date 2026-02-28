import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsNumber,
  Min,
  Max,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { CourseType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCourseDto {
  @ApiProperty({ example: 'Quran Memorization Foundation' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title!: string;

  @ApiProperty({
    example: 'Comprehensive course for beginners to memorize Juz 30 with proper tajweed.',
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: CourseType })
  @IsEnum(CourseType)
  @IsNotEmpty()
  courseType!: CourseType;

  @ApiProperty({ example: 6 })
  @IsInt()
  @Min(1)
  @Max(24)
  durationMonths!: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  priceMonthly!: number;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @IsOptional()
  @Min(2)
  @Max(10)
  maxStudentsPerGroup?: number;
}

export class UpdateCourseDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: CourseType })
  @IsOptional()
  @IsEnum(CourseType)
  courseType?: CourseType;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(24)
  durationMonths?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  priceMonthly?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Min(2)
  @Max(10)
  maxStudentsPerGroup?: number;
}
