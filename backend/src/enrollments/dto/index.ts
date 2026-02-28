import {
  IsUUID,
  IsNotEmpty,
  IsEnum,
  IsString,
  IsOptional,
  IsInt,
  IsNumber,
} from 'class-validator';
import { PackageType, EnrollmentStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  studentId!: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  courseId!: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  teacherId!: string;

  @ApiProperty({ enum: PackageType })
  @IsEnum(PackageType)
  @IsNotEmpty()
  packageType!: PackageType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startDate!: string;
}

export class UpdateEnrollmentStatusDto {
  @ApiProperty({ enum: EnrollmentStatus })
  @IsEnum(EnrollmentStatus)
  @IsNotEmpty()
  status!: EnrollmentStatus;
}

export class UpdateEnrollmentProgressDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  progressPercentage!: number;
}
