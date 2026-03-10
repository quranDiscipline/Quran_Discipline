import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsEmail,
  MaxLength,
  IsDateString,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { Sex, BookingStatus } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName!: string;

  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  whatsappNumber!: string;

  @ApiProperty({ enum: Sex })
  @IsEnum(Sex)
  @IsNotEmpty()
  sex!: Sex;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  country!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  currentLevel!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  preferredPackage!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  preferredTeacherSex?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  message?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  preferredDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  preferredTime?: string;

  @ApiPropertyOptional({ description: 'ID of the selected time slot (format: teacherId-date-startTime). If provided, teacher will be pre-assigned.' })
  @IsString()
  @IsOptional()
  selectedSlotId?: string;

  @ApiProperty({ description: 'Client timezone in IANA format (e.g., America/New_York, Europe/London)' })
  @IsString()
  @IsNotEmpty()
  timezone!: string;
}

export class AssignBookingDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  teacherId!: string;
}

export class ConfirmBookingDto {
  @ApiProperty()
  @IsUrl()
  @IsNotEmpty()
  zoomLink!: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  confirmedDate!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  confirmedTime!: string;
}
