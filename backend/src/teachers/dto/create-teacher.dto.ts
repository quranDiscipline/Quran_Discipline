import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MinLength,
  Matches,
  MaxLength,
  IsArray,
  IsInt,
  Min,
  Max,
  IsUrl,
} from 'class-validator';
import { Sex } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeacherDto {
  @ApiProperty({ example: 'teacher@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: 'Ahmad Ibrahim' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName!: string;

  @ApiProperty({ enum: Sex })
  @IsEnum(Sex)
  @IsNotEmpty()
  sex!: Sex;

  @ApiProperty({ example: 'TempPass123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least 1 uppercase letter and 1 number',
  })
  temporaryPassword!: string;

  @ApiPropertyOptional({
    example: 'Experienced Quran teacher with 10+ years of teaching tajweed and memorization.',
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({
    example: ["Bachelor's in Islamic Studies", "Ijazah in Quran Recitation"],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  qualifications?: string[];

  @ApiPropertyOptional({ example: ['Tajweed', 'Memorization', 'Islamic Studies'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  specializations?: string[];

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  whatsappNumber?: string;

  @ApiPropertyOptional({ example: 'Egypt' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: 25 })
  @IsInt()
  @IsOptional()
  @Min(5)
  @Max(100)
  hourlyRate?: number;

  @ApiPropertyOptional({
    example: 'https://example.com/photo.jpg',
    description: 'Profile photo URL',
  })
  @IsUrl()
  @IsOptional()
  profilePictureUrl?: string;
}
