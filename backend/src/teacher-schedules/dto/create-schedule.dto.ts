import { ApiProperty } from '@nestjs/swagger';
import { DayOfWeek } from '@prisma/client';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  Matches,
} from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({ description: 'Teacher ID' })
  @IsString()
  teacherId!: string;

  @ApiProperty({
    description: 'Day of the week',
    enum: DayOfWeek,
    example: 'monday',
  })
  @IsEnum(DayOfWeek)
  dayOfWeek!: DayOfWeek;

  @ApiProperty({
    description: 'Start time in HH:MM format',
    example: '10:00',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  startTime!: string;

  @ApiProperty({
    description: 'End time in HH:MM format',
    example: '11:00',
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  endTime!: string;

  @ApiProperty({
    description: 'Whether this schedule is available for booking',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({
    description: 'Maximum number of students for this slot',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxStudents?: number;
}
